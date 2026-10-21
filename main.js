import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import translations from './translations.json';
import './style.css';

const $ = (id) => document.getElementById(id);
const viewer = $('viewer');
const loading = $('loading');
const loadProgress = $('loadProgress');
const errorBox = $('viewerError');
const listEl = $('structureList');
const searchEl = $('search');
const regionFilter = $('regionFilter');
const sideFilter = $('sideFilter');

let system = 'muscle';
let activeLayer = 'superficial muscles';
let tissueFilter = 'all';
let showSkeleton = false;
let showCombinedMuscles = true;
let showCombinedSkeleton = true;
let selected = null;
let allStructures = [];
let modelRoot = null;
let originalMaterials = new Map();
let selectedMeshes = [];
let previousSelectedMaterials = new Map();
let cameraHome = new THREE.Vector3(0, 0.8, 3.3);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#edf3f0');
const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
camera.position.copy(cameraHome);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
viewer.prepend(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 0.65;
controls.maxDistance = 8;
controls.target.set(0, 0.85, 0);
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x7b8c83, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5); keyLight.position.set(3, 5, 4); scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xe2f2ff, 1.15); fillLight.position.set(-4, 2, 1); scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0xffe4cf, 1.7); rimLight.position.set(0, 3, -4); scene.add(rimLight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

function norm(s = '') { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function layerPt(layer) {
  return ({'skeleton':'Esqueleto','deep muscles':'Musculatura profunda','superficial muscles':'Musculatura superficial'})[layer] || layer || '—';
}
function sidePt(side) { return ({left:'Esquerdo',right:'Direito',midline:'Linha média'})[side] || 'Não especificado'; }
function labelFor(meta) {
  const item = translations[meta.name];
  if (item?.pt) return item.pt;
  return meta.name || 'Estrutura sem nome traduzido';
}
function groupFor(meta) { return meta.group ? labelFor({name: meta.group}) : '—'; }
function categoryFor(meta) {
  if (meta.layer === 'skeleton') {
    const tissue = meta.tissue || 'bone';
    return ({bone:'Osso',cartilage:'Cartilagem',tooth:'Dente',eye:'Estrutura ocular'})[tissue] || 'Estrutura esquelética';
  }
  return meta.layer === 'deep muscles' ? 'Músculo profundo' : 'Músculo superficial';
}
function regionFor(meta) {
  const name = norm(meta.name);
  const groups = [
    ['Cabeça e face', /skull|cranial|nasal|zygomatic|mandible|maxilla|temporal bone|frontal bone|occipital|parietal|sphenoid|ethmoid|eye|eyelid|ear|masseter|temporalis|orbicularis oculi|orbicularis oris|buccinator|frontalis|platysma|tongue|hyoid|tooth|teeth/],
    ['Pescoço', /cervical|neck|sternocleidomastoid|scalene|longus colli|longus capitis|thyrohyoid|omohyoid|sternohyoid|sternothyroid|splenius capitis|semispinalis capitis/],
    ['Dorso e coluna', /vertebra|spine|spinal|sacrum|coccyx|multifidus|rotatores|interspinales|intertransversarii|erector spinae|longissimus|iliocostalis|spinalis|rhomboid|trapezius|latissimus dorsi|quadratus lumborum|thoracolumbar fascia/],
    ['Tórax', /rib|sternum|thoracic|pectoralis|intercostal|serratus anterior|serratus posterior|transversus thoracis|diaphragm/],
    ['Abdome', /abdom|rectus abdominis|oblique|transversus abdominis|linea alba|inguinal|psoas|iliacus/],
    ['Ombro e braço', /clavicle|scapula|humerus|deltoid|rotator cuff|supraspinatus|infraspinatus|subscapularis|teres major|teres minor|coracobrachialis|biceps brachii|triceps brachii|brachialis|brachioradialis|anconeus/],
    ['Antebraço e mão', /radius|ulna|carpal|metacarpal|phalanx of .*finger|phalanx of .*thumb|thenar|hypothenar|lumbrical|interossei|flexor carpi|extensor carpi|flexor digitorum|extensor digitorum|pronator|supinator|palmaris|abductor pollicis|opponens pollicis/],
    ['Pelve e quadril', /pelvis|hip bone|ilium|ischium|pubis|acetabulum|glute|piriformis|obturator|gemellus|quadratus femoris|tensor fasciae latae|sacroiliac/],
    ['Coxa', /femur|quadriceps|vastus|rectus femoris|hamstring|biceps femoris|semitendinosus|semimembranosus|adductor|gracilis|sartorius|pectineus/],
    ['Joelho', /patella|knee|meniscus/],
    ['Perna e pé', /tibia|fibula|talus|calcaneus|tarsal|metatarsal|phalanx of .*toe|gastrocnemius|soleus|plantaris|tibialis|peroneus|fibularis|extensor hallucis|flexor hallucis|extensor digitorum longus|flexor digitorum longus|popliteus|achilles|calcaneal tendon|foot|ankle/]
  ];
  return groups.find(([, re]) => re.test(name))?.[0] || (meta.layer === 'skeleton' ? 'Esqueleto' : 'Musculatura');
}
function structureMeta(obj) {
  const meta = obj.userData || {};
  const name = meta.name || obj.name || 'Estrutura sem nome';
  return { name, layer: meta.layer || 'skeleton', side: meta.side || 'midline', source: meta.source || '', fma: meta.fma || '', group: meta.group || '', tissue: meta.tissue || 'bone' };
}
function setStructureVisibility() {
  for (const item of allStructures) {
    const m = item.meta;
    let visible;
    if (system === 'muscle') {
      visible = m.layer !== 'skeleton' && (activeLayer === 'all-muscles' || m.layer === activeLayer);
      if (showSkeleton && m.layer === 'skeleton') visible = true;
    } else if (system === 'skeleton') {
      visible = m.layer === 'skeleton' && (tissueFilter === 'all' || m.tissue === tissueFilter);
    } else {
      visible = m.layer === 'skeleton' ? showCombinedSkeleton : showCombinedMuscles;
    }
    for (const mesh of item.meshes.length ? item.meshes : [item.obj]) mesh.visible = visible;
  }
  if (selected && !selected.obj.visible) clearSelection(true);
  renderList();
}
function clearSelection(updatePanel = true) {
  for (const [mesh, material] of previousSelectedMaterials) mesh.material = material;
  previousSelectedMaterials.clear(); selectedMeshes = []; selected = null;
  if (updatePanel) {
    $('categoryTag').textContent = system === 'muscle' ? 'Sistema muscular' : system === 'skeleton' ? 'Sistema esquelético' : 'Sistema integrado';
    $('partName').textContent = 'Selecione uma estrutura';
    $('originalName').textContent = 'Nome original do modelo';
    $('description').textContent = 'Clique em uma estrutura do modelo 3D ou escolha um item na lista para ver os detalhes disponíveis.';
    $('regionValue').textContent = '—'; $('sideValue').textContent = '—'; $('groupValue').textContent = '—'; $('fmaValue').textContent = '—';
  }
  renderList();
}
function selectStructure(item) {
  if (!item) return clearSelection();
  clearSelection(false);
  selected = item;
  const meshes = item.meshes.length ? item.meshes : [item.obj];
  for (const mesh of meshes) {
    if (!mesh.material) continue;
    previousSelectedMaterials.set(mesh, mesh.material);
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const highlighted = mats.map(mat => {
      const clone = mat.clone();
      clone.emissive = new THREE.Color('#f3a623');
      clone.emissiveIntensity = 0.42;
      return clone;
    });
    mesh.material = Array.isArray(mesh.material) ? highlighted : highlighted[0];
    selectedMeshes.push(mesh);
  }
  const m = item.meta;
  $('categoryTag').textContent = categoryFor(m);
  $('partName').textContent = labelFor(m);
  $('originalName').textContent = m.name;
  const t = translations[m.name];
  $('description').textContent = t?.note || 'Nome traduzido para facilitar o estudo. Consulte um atlas anatômico para confirmar detalhes de inserções, inervação e função.';
  $('regionValue').textContent = `${regionFor(m)} · ${layerPt(m.layer)}`;
  $('sideValue').textContent = sidePt(m.side);
  $('groupValue').textContent = m.group ? labelFor({name:m.group}) : '—';
  $('fmaValue').textContent = m.fma || '—';
  renderList();
}
function visibleItems() {
  const q = norm(searchEl.value);
  const region = regionFilter.value;
  const side = sideFilter.value;
  return allStructures.filter(item => {
    const m = item.meta;
    if (system === 'muscle' && m.layer === 'skeleton') return false;
    if (system === 'skeleton' && m.layer !== 'skeleton') return false;
    if (system === 'muscle' && activeLayer !== 'all-muscles' && m.layer !== activeLayer) return false;
    if (system === 'muscle' && showSkeleton && m.layer === 'skeleton') return false;
    if (system === 'skeleton' && tissueFilter !== 'all' && m.tissue !== tissueFilter) return false;
    if (system === 'combined' && m.layer === 'skeleton' && !showCombinedSkeleton) return false;
    if (system === 'combined' && m.layer !== 'skeleton' && !showCombinedMuscles) return false;
    if (side !== 'all' && m.side !== side) return false;
    if (region !== 'all' && regionFor(m) !== region) return false;
    const pt = norm(labelFor(m));
    const original = norm(m.name);
    const group = norm(m.group);
    return !q || pt.includes(q) || original.includes(q) || group.includes(q) || norm(regionFor(m)).includes(q);
  }).sort((a,b) => labelFor(a.meta).localeCompare(labelFor(b.meta), 'pt-BR'));
}
function renderList() {
  if (!listEl || !allStructures.length) return;
  const items = visibleItems();
  $('countLabel').textContent = `${items.length} estruturas`;
  listEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (const item of items.slice(0, 634)) {
    const button = document.createElement('button');
    button.className = 'structure' + (selected === item ? ' active' : '');
    button.type = 'button';
    const name = document.createElement('span'); name.textContent = labelFor(item.meta);
    const side = document.createElement('small'); side.textContent = item.meta.side === 'left' ? 'E' : item.meta.side === 'right' ? 'D' : '';
    button.append(name, side);
    button.title = item.meta.name;
    button.addEventListener('click', () => {
      if (!item.obj.visible) setStructureVisibility();
      selectStructure(item);
      $('partName').scrollIntoView({block:'nearest',behavior:'smooth'});
    });
    fragment.append(button);
  }
  if (!items.length) { const empty = document.createElement('div'); empty.className='list-empty'; empty.textContent='Nenhuma estrutura corresponde aos filtros.'; fragment.append(empty); }
  listEl.append(fragment);
}
function fillRegions() {
  const current = regionFilter.value;
  const regions = [...new Set(allStructures.filter(x => system === 'muscle' ? x.meta.layer !== 'skeleton' : system === 'skeleton' ? x.meta.layer === 'skeleton' : true).map(x => regionFor(x.meta)))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  regionFilter.innerHTML = '<option value="all">Todas as regiões</option>';
  for (const r of regions) { const option = document.createElement('option'); option.value = r; option.textContent = r; regionFilter.append(option); }
  if (regions.includes(current)) regionFilter.value = current;
}
function setSystem(next) {
  system = next;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.system === system));
  $('viewerTitle').textContent = system === 'muscle' ? 'Modelo muscular 3D' : system === 'skeleton' ? 'Modelo esquelético 3D' : 'Modelo integrado: músculos + esqueleto';
  $('muscleLayers').hidden = system !== 'muscle'; $('skeletonLayers').hidden = system !== 'skeleton'; $('combinedLayers').hidden = system !== 'combined';
  regionFilter.value = 'all'; searchEl.value = ''; clearSelection(); fillRegions(); setStructureVisibility();
}
function frameView(back = false) {
  const target = controls.target.clone();
  camera.position.set(back ? 0 : 0, 0.9, back ? -3.4 : 3.4);
  controls.target.copy(target); controls.update();
}
function resize() {
  const width = Math.max(1, viewer.clientWidth); const height = Math.max(1, viewer.clientHeight);
  camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
}
function onPointerDown(event) { pointerDown = {x:event.clientX,y:event.clientY}; }
function onPointerUp(event) {
  if (!pointerDown || Math.hypot(event.clientX-pointerDown.x,event.clientY-pointerDown.y) > 5) { pointerDown = null; return; }
  pointerDown = null;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const visibleMeshes = allStructures.filter(x=>x.obj.visible).flatMap(x=>x.meshes.length?x.meshes:[x.obj]);
  const hits = raycaster.intersectObjects(visibleMeshes, false);
  if (!hits.length) return;
  const mesh = hits[0].object;
  const item = allStructures.find(x => x.meshes.includes(mesh) || x.obj === mesh);
  if (item) selectStructure(item);
}

const loader = new GLTFLoader();
loader.load('/models/ecorche.glb', (gltf) => {
  modelRoot = gltf.scene;
  scene.add(modelRoot);
  const byName = new Map();
  modelRoot.traverse(obj => {
    if (!obj.isMesh) return;
    const meta = structureMeta(obj);
    let item = byName.get(meta.name);
    if (!item) {
      item = {obj, meta, meshes: []}; byName.set(meta.name, item); allStructures.push(item);
    }
    item.meshes.push(obj);
    originalMaterials.set(obj, obj.material);
    obj.frustumCulled = true;
  });
  // The GLB root preserves the original anatomical scale and axis. Fit the whole body to the camera.
  const box = new THREE.Box3().setFromObject(modelRoot);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  modelRoot.position.sub(center);
  modelRoot.scale.multiplyScalar(2.15 / maxDim);
  controls.target.set(0, 0, 0); camera.position.set(0, 0.12, 3.2); controls.update();
  loading.hidden = true;
  $('viewerSubtitle').textContent = `${allStructures.length} estruturas nomeadas · modelo Écorché`;
  fillRegions(); setStructureVisibility();
  const preferred = allStructures.find(x => /rectus abdominis/i.test(x.meta.name)) || allStructures.find(x => x.meta.layer === 'superficial muscles') || allStructures[0];
  if (preferred) selectStructure(preferred);
  resize();
}, (event) => {
  if (event.total) loadProgress.textContent = `Carregando ${Math.round(event.loaded/event.total*100)}%`;
  else loadProgress.textContent = `Carregados ${(event.loaded/1024/1024).toFixed(1)} MB`;
}, (error) => {
  console.error(error); loading.hidden = true; errorBox.hidden = false;
  errorBox.textContent = 'Não foi possível carregar o modelo. Confira se public/models/ecorche.glb existe e se você abriu o projeto pelo comando npm run dev. Depois, atualize a página.';
});

// Layer controls
for (const button of document.querySelectorAll('[data-layer]')) button.addEventListener('click', () => {
  activeLayer = button.dataset.layer;
  document.querySelectorAll('[data-layer]').forEach(b=>b.classList.toggle('active', b===button));
  fillRegions(); setStructureVisibility();
});
for (const button of document.querySelectorAll('[data-tissue]')) button.addEventListener('click', () => {
  tissueFilter = button.dataset.tissue;
  document.querySelectorAll('[data-tissue]').forEach(b=>b.classList.toggle('active', b===button));
  fillRegions(); setStructureVisibility();
});
$('showSkeleton').addEventListener('change', event => { showSkeleton = event.target.checked; setStructureVisibility(); });
$('combinedMuscles').addEventListener('change', event => { showCombinedMuscles = event.target.checked; setStructureVisibility(); });
$('combinedSkeleton').addEventListener('change', event => { showCombinedSkeleton = event.target.checked; setStructureVisibility(); });
document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => setSystem(button.dataset.system)));
$('frontBtn').addEventListener('click', () => frameView(false)); $('backBtn').addEventListener('click', () => frameView(true));
$('resetBtn').addEventListener('click', () => { frameView(false); controls.reset(); });
searchEl.addEventListener('input', renderList); regionFilter.addEventListener('change', renderList); sideFilter.addEventListener('change', renderList);
$('clearSelection').addEventListener('click', () => clearSelection());
renderer.domElement.addEventListener('pointerdown', onPointerDown); renderer.domElement.addEventListener('pointerup', onPointerUp);
window.addEventListener('resize', resize); if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewer);
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); }
resize(); animate();
