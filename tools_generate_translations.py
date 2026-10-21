import struct,json,re
from pathlib import Path
p=Path('/mnt/data/anatomia3d-completo/public/models/ecorche.glb')
with p.open('rb') as f:
    f.read(12); n,typ=struct.unpack('<II',f.read(8)); data=json.loads(f.read(n).decode('utf-8').rstrip('\x00 '))
# Longest anatomical phrases first. The original English identifier is always retained in the JSON.
phrases = {
'inferior nasal concha':'concha nasal inferior','lateral nasal cartilage':'cartilagem nasal lateral','major alar cartilage':'cartilagem alar maior','lateral cuneiform bone':'cuneiforme lateral','medial cuneiform bone':'cuneiforme medial','intermediate cuneiform bone':'cuneiforme intermédio','upper central secondary incisor tooth':'incisivo central superior decíduo','lower central secondary incisor tooth':'incisivo central inferior decíduo','upper lateral secondary incisor tooth':'incisivo lateral superior decíduo','lower lateral secondary incisor tooth':'incisivo lateral inferior decíduo','upper first secondary molar tooth':'primeiro molar superior decíduo','upper second secondary molar tooth':'segundo molar superior decíduo','lower first secondary molar tooth':'primeiro molar inferior decíduo','lower second secondary molar tooth':'segundo molar inferior decíduo','upper first secondary premolar tooth':'primeiro pré-molar superior decíduo','upper second secondary premolar tooth':'segundo pré-molar superior decíduo','lower first secondary premolar tooth':'primeiro pré-molar inferior decíduo','lower second secondary premolar tooth':'segundo pré-molar inferior decíduo','upper secondary canine tooth':'canino superior decíduo','lower secondary canine tooth':'canino inferior decíduo','long head':'cabeça longa','short head':'cabeça curta','lateral head':'cabeça lateral','medial head':'cabeça medial','humeral head':'cabeça umeral','ulnar head':'cabeça ulnar','inferior head':'cabeça inferior','superior head':'cabeça superior','oblique head':'cabeça oblíqua','transverse head':'cabeça transversa','ascending part':'parte ascendente','descending part':'parte descendente','transverse part':'parte transversa','spinal part':'parte espinal','acromial part':'parte acromial','clavicular part':'parte clavicular','sternocostal part':'parte esternocostal','abdominal part':'parte abdominal','orbital part':'porção orbital','palpebral part':'porção palpebral','deep part':'porção profunda','superficial part':'porção superficial','external intercostal muscle':'intercostal externo','infraspinatus muscle':'infraespinal','left deltoid':'deltoide esquerdo','distal phalanx':'falange distal','proximal phalanx':'falange proximal','middle phalanx':'falange média','intervertebral disk':'disco intervertebral','opponens digiti minimi of foot':'oponente do dedo mínimo do pé','opponens digiti minimi of hand':'oponente do dedo mínimo da mão','abductor digiti minimi of foot':'abdutor do dedo mínimo do pé','abductor digiti minimi of hand':'abdutor do dedo mínimo da mão','navicular bone':'osso navicular','big toe':'hálux','little toe':'dedo mínimo do pé','second toe':'segundo dedo do pé','third toe':'terceiro dedo do pé','fourth toe':'quarto dedo do pé','index finger':'dedo indicador','little finger':'dedo mínimo','middle finger':'dedo médio','ring finger':'dedo anelar','thumb':'polegar','body of sternum':'corpo do esterno','manubrium of sternum':'manúbrio do esterno','xiphoid process':'processo xifoide','sternal angle':'ângulo esternal',
'gluteus maximus':'glúteo máximo','gluteus medius':'glúteo médio','gluteus minimus':'glúteo mínimo','tensor fasciae latae':'tensor da fáscia lata',
'levator scapulae':'levantador da escápula','serratus anterior':'serrátil anterior','serratus posterior superior':'serrátil posterior superior','serratus posterior inferior':'serrátil posterior inferior',
'pectoralis major':'peitoral maior','pectoralis minor':'peitoral menor','rectus abdominis':'reto do abdome','transversus abdominis':'transverso do abdome','external oblique':'oblíquo externo do abdome','internal oblique':'oblíquo interno do abdome',
'quadratus lumborum':'quadrado lombar','erector spinae':'eretor da espinha','longissimus thoracis':'longuíssimo do tórax','iliocostalis lumborum':'iliocostal lombar','spinalis thoracis':'espinal torácico',
'latissimus dorsi':'latíssimo do dorso','trapezius':'trapézio','rhomboid major':'romboide maior','rhomboid minor':'romboide menor','sternocleidomastoid':'esternocleidomastoideo',
'biceps brachii':'bíceps braquial','triceps brachii':'tríceps braquial','brachialis':'braquial','coracobrachialis':'coracobraquial','brachioradialis':'braquiorradial',
'deltoid':'deltoide','supraspinatus':'supraespinal','infraspinatus':'infraespinal','subscapularis':'subescapular','teres major':'redondo maior','teres minor':'redondo menor',
'flexor carpi radialis':'flexor radial do carpo','flexor carpi ulnaris':'flexor ulnar do carpo','extensor carpi radialis longus':'extensor radial longo do carpo','extensor carpi radialis brevis':'extensor radial curto do carpo','extensor carpi ulnaris':'extensor ulnar do carpo',
'flexor digitorum superficialis':'flexor superficial dos dedos','flexor digitorum profundus':'flexor profundo dos dedos','extensor digitorum':'extensor dos dedos','flexor pollicis longus':'flexor longo do polegar','extensor pollicis longus':'extensor longo do polegar','extensor pollicis brevis':'extensor curto do polegar','abductor pollicis longus':'abdutor longo do polegar',
'quadriceps femoris':'quadríceps femoral','rectus femoris':'reto femoral','vastus lateralis':'vasto lateral','vastus medialis':'vasto medial','vastus intermedius':'vasto intermédio',
'biceps femoris':'bíceps femoral','semitendinosus':'semitendíneo','semimembranosus':'semimembranáceo','adductor magnus':'adutor magno','adductor longus':'adutor longo','adductor brevis':'adutor curto','gracilis':'grácil','sartorius':'sartório','pectineus':'pectíneo',
'gastrocnemius':'gastrocnêmio','soleus':'sóleo','plantaris':'plantar','tibialis anterior':'tibial anterior','tibialis posterior':'tibial posterior','fibularis longus':'fibular longo','fibularis brevis':'fibular curto','peroneus longus':'fibular longo','peroneus brevis':'fibular curto','popliteus':'poplíteo',
'flexor hallucis longus':'flexor longo do hálux','extensor hallucis longus':'extensor longo do hálux','flexor digitorum longus':'flexor longo dos dedos','extensor digitorum longus':'extensor longo dos dedos','calcaneal tendon':'tendão calcâneo',
'psoas major':'psoas maior','psoas minor':'psoas menor','iliacus':'ilíaco','piriformis':'piriforme','obturator internus':'obturador interno','obturator externus':'obturador externo','quadratus femoris':'quadrado femoral','gemellus superior':'gêmeo superior','gemellus inferior':'gêmeo inferior',
'multifidus':'multífido','rotatores':'rotadores','interspinales':'interespinais','intertransversarii':'intertransversários','splenius capitis':'esplênio da cabeça','splenius cervicis':'esplênio do pescoço','semispinalis capitis':'semiespinal da cabeça','semispinalis cervicis':'semiespinal do pescoço',
'orbicularis oculi':'orbicular do olho','orbicularis oris':'orbicular da boca','levator labii superioris':'levantador do lábio superior','depressor anguli oris':'depressor do ângulo da boca','zygomaticus major':'zigomático maior','zygomaticus minor':'zigomático menor','buccinator':'bucinador','masseter':'masseter','temporalis':'temporal','frontalis':'frontal','occipitalis':'occipital','platysma':'platisma','mentalis':'mentoniano',
'iliac crest':'crista ilíaca','anterior superior iliac spine':'espinha ilíaca anterossuperior','anterior inferior iliac spine':'espinha ilíaca anteroinferior','posterior superior iliac spine':'espinha ilíaca posterossuperior','posterior inferior iliac spine':'espinha ilíaca posteroinferior',
'cervical vertebra':'vértebra cervical','thoracic vertebra':'vértebra torácica','lumbar vertebra':'vértebra lombar','spinous process':'processo espinhoso','transverse process':'processo transverso','vertebral body':'corpo vertebral','intervertebral disc':'disco intervertebral','sacrum':'sacro','coccyx':'cóccix',
'clavicle':'clavícula','scapula':'escápula','humerus':'úmero','radius':'rádio','ulna':'ulna','femur':'fêmur','patella':'patela','tibia':'tíbia','fibula':'fíbula','sternum':'esterno','rib':'costela','costal cartilage':'cartilagem costal','pelvis':'pelve','hip bone':'osso do quadril','ilium':'ílio','ischium':'ísquio','pubis':'púbis','sacrum':'sacro','talus':'tálus','calcaneus':'calcâneo','navicular':'navicular','cuboid':'cuboide','cuneiform':'cuneiforme','metatarsal':'metatarsal','metacarpal':'metacarpal','carpal':'carpo','phalange':'falange','phalanx':'falange','mandible':'mandíbula','maxilla':'maxila','zygomatic bone':'osso zigomático','temporal bone':'osso temporal','frontal bone':'osso frontal','parietal bone':'osso parietal','occipital bone':'osso occipital','sphenoid':'esfenoide','ethmoid':'etmoide','nasal bone':'osso nasal','lacrimal bone':'osso lacrimal','vomer':'vômer','palatine bone':'osso palatino','atlas':'atlas (C1)','axis':'áxis (C2)','hyoid':'hioide','sternum':'esterno','patella':'patela','teeth':'dentes','tooth':'dente','external ear':'orelha externa','eye':'olho',
'cartilage':'cartilagem','secondary':'decíduo','incisor':'incisivo','molar':'molar','premolar':'pré-molar','canine':'canino','lower':'inferior','upper':'superior','distal':'distal','proximal':'proximal','middle':'médio','first':'primeiro','second':'segundo','third':'terceiro','fourth':'quarto','fifth':'quinto','sixth':'sexto','seventh':'sétimo','eighth':'oitavo','ninth':'nono','tenth':'décimo','eleventh':'décimo primeiro','twelfth':'décimo segundo','lumbrical':'lumbrical','interosseous':'interósseo','interossei':'interósseos','corrugator supercilii':'corrugador do supercílio','depressor labii inferioris':'depressor do lábio inferior','levator labii superioris':'levantador do lábio superior','orbicularis oculi':'orbicular do olho','orbicularis oris':'orbicular da boca','iliotibial tract':'trato iliotibial','linea alba':'linha alba','iliocostalis':'iliocostal','longissimus':'longuíssimo','infraspinatus':'infraespinal','supraspinatus':'supraespinal','scalenus':'escaleno','obliquus capitis':'oblíquo da cabeça','rectus capitis':'reto da cabeça','adductor hallucis':'adutor do hálux','adductor pollicis':'adutor do polegar','abductor hallucis':'abdutor do hálux','abductor pollicis':'abdutor do polegar','opponens pollicis':'oponente do polegar','opponens digiti minimi':'oponente do dedo mínimo','flexor digiti minimi':'flexor do dedo mínimo','extensor indicis':'extensor do indicador','nasalis':'nasal','risorius':'risório','procerus':'prócero','mentalis':'mentoniano','palmaris longus':'palmar longo','pronator quadratus':'pronador quadrado','pronator teres':'pronador redondo','supinator':'supinador','external oblique':'oblíquo externo do abdome','internal oblique':'oblíquo interno do abdome','transversus abdominis':'transverso do abdome','tibialis posterior':'tibial posterior','foot':'pé','hand':'mão','of hand':'da mão','of foot':'do pé','disk':'disco','bone':'osso','cartilage':'cartilagem','fascia':'fáscia','tendon':'tendão','ligament':'ligamento','bone':'osso','muscle':'músculo','head':'cabeça','neck':'pescoço','body':'corpo','base':'base','shaft':'corpo','angle':'ângulo','process':'processo','tubercle':'tubérculo','tuberosity':'tuberosidade','condyle':'côndilo','epicondyle':'epicôndilo','fossa':'fossa','foramen':'forame','canal':'canal','notch':'incisura','crest':'crista','spine':'espinha','surface':'superfície','medial':'medial','lateral':'lateral','superior':'superior','inferior':'inferior','anterior':'anterior','posterior':'posterior','deep':'profundo','superficial':'superficial','left':'esquerdo','right':'direito','of':'do','and':'e','the':'',
}
# Translate by longest phrase substitutions first; then basic anatomical vocabulary. Keep English in original field for searching.
keys=sorted(phrases,key=len,reverse=True)

def translate(name):
    s=name
    side_suffix = ''
    side_match = re.search(r'\b(Left|Right)\b', s, flags=re.I)
    if side_match:
        side_suffix = ' esquerdo' if side_match.group(1).lower() == 'left' else ' direito'
        s = re.sub(r'\b(Left|Right)\b', '', s, flags=re.I)
        s = re.sub(r'\s+', ' ', s).strip()
    # normalize phrase replacement case-insensitively, longest terms first
    for key in keys:
        pattern=r'(?<![A-Za-z])'+re.escape(key)+r'(?![A-Za-z])'
        s=re.sub(pattern,phrases[key],s,flags=re.I)
    # ordinal vertebral numbers and digits retained; turn word-side to PT if still present
    s=re.sub(r'\bleft\b','esquerdo',s,flags=re.I); s=re.sub(r'\bright\b','direito',s,flags=re.I)
    s=re.sub(r'\bof\b','do',s,flags=re.I)
    s=re.sub(r'\s+',' ',s).strip(' ,')
    # move side descriptor to the end, as Portuguese anatomical nomenclature does
    if side_suffix:
        ending = s.split()[-1].lower() if s.split() else ''
        feminine = ending.endswith(('a','ção','agem','ula','ela','ia','ice')) or ending in {'costela','clavícula','escápula','vértebra','falange','cartilagem','fáscia','ulna','tíbia','fíbula','patela','pelve','maxila','mandíbula','espinha','crista','incisura','orelha','costal'}
        side_suffix = side_suffix.replace('esquerdo','esquerda') if feminine and 'esquerdo' in side_suffix else side_suffix
        side_suffix = side_suffix.replace('direito','direita') if feminine and 'direito' in side_suffix else side_suffix
        s = s + side_suffix
    # common multi-word anatomical groups and parts
    s=re.sub(r'\bset of palmar interossei\b','conjunto dos interósseos palmares',s,flags=re.I)
    s=re.sub(r'\bset of dorsal interossei\b','conjunto dos interósseos dorsais',s,flags=re.I)
    s=re.sub(r'\bset of lumbricals\b','conjunto dos lumbricais',s,flags=re.I)
    s=re.sub(r'\bfirst lumbrical\b','primeiro lumbrical',s,flags=re.I)
    s=re.sub(r'\bsecond lumbrical\b','segundo lumbrical',s,flags=re.I)
    s=re.sub(r'\bthird lumbrical\b','terceiro lumbrical',s,flags=re.I)
    s=re.sub(r'\bfourth lumbrical\b','quarto lumbrical',s,flags=re.I)
    s=re.sub(r'\bof the\b','do',s,flags=re.I)
    s=re.sub(r'\bdo (primeira|segunda|terceira|quarta|quinta|sexta|sétima|oitava|nona|décima) vértebra\b',r'da \1 vértebra',s,flags=re.I)
    s=re.sub(r'\bdo mão\b','da mão',s,flags=re.I)
    s=re.sub(r'\s+',' ',s).strip()
    # grammatical agreement for ordinal adjectives preceding feminine anatomical nouns
    s=re.sub(r'\b(primeiro|segundo|terceiro|quarto|quinto|sexto|sétimo|oitavo|nono|décimo|décimo primeiro|décimo segundo) (costela|cartilagem|falange|vértebra|concha|crista|clavícula|escápula)', lambda m: m.group(1)[:-1]+'a '+m.group(2), s, flags=re.I)
    # lowercase normal terms but capitalize initial
    if s: s=s[0].upper()+s[1:]
    # correct common left/right gender based on final structure word heuristics
    if re.search(r'\b(esquerdo|direito)$',s,re.I):
        if re.search(r'(costela|clavícula|escápula|vértebra|falange|cartilagem|fáscia|artéria|veia|ulna|tíbia|fíbula|patela|pelve|maxila|mandíbula|espinha|crista|incisura|cabeça|costal|orelha|órbita|cavidade|linha)$',s,re.I):
            s=re.sub(r'(esquerdo|direito)$',lambda m:'esquerda' if m.group(1).lower()=='esquerdo' else 'direita',s,flags=re.I)
    # retain sensible partial fallback rather than empty
    return s or name

out={}
for node in data.get('nodes',[]):
    ex=node.get('extras') or {}
    if not ex.get('name'): continue
    name=ex['name']
    pt=translate(name)
    # reviewed is intentionally false for generated terms: medical nomenclature should be checked by a human
    out[name]={'pt':pt,'reviewed':False,'layer':ex.get('layer',''),'side':ex.get('side',''),'tissue':ex.get('tissue',''),'group':ex.get('group',''),'fma':ex.get('fma','')}
Path('/mnt/data/anatomia3d-completo/src/translations.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('entries',len(out))
for x in ['Left gluteus maximus','Right femur','Left psoas major','Left tibialis anterior','Left deltoid']:
 print(x,'=>',out.get(x,{}).get('pt'))
