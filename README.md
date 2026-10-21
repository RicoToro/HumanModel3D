# Anatomia 3D — projeto completo

Aplicação web local com visualizador anatômico 3D, feita com Vite + Three.js. Inclui o arquivo `public/models/ecorche.glb` que você anexou e um dicionário JSON com 634 estruturas originais e rótulos em português gerados por regras de tradução anatômica.

## Requisitos
- Node.js 20 ou superior (recomendado)
- Navegador moderno com WebGL

## Como executar no Windows
1. Extraia o ZIP para uma pasta, por exemplo `C:\\Projetos\\anatomia3d-completo`.
2. Abra essa pasta no VS Code ou abra um terminal dentro dela.
3. Execute:

   ```bash
   npm install
   npm run dev
   ```

4. Abra no navegador o endereço local mostrado no terminal (normalmente `http://localhost:5173`).

Para gerar a versão otimizada para publicação:

```bash
npm run build
```

A versão de produção fica na pasta `dist/`.

## Funcionalidades
- Modelo GLB real carregado no Three.js.
- Rotação, zoom e controles de vista anterior/posterior.
- Abas para sistema muscular e esquelético.
- Filtros para musculatura superficial/profunda, esqueleto, ossos, cartilagens e dentes.
- Seleção por clique no modelo e por lista.
- Busca por nome original em inglês ou rótulo em português.
- Filtros por região e lado do corpo.
- Ficha com nome original, região, camada, lado, grupo e identificador FMA quando disponível.

## Importante sobre a tradução
O arquivo `src/translations.json` contém entradas para todas as 634 estruturas encontradas no GLB. Os rótulos foram gerados por regras e um glossário anatômico; o campo `reviewed` está como `false` para indicar que **não houve revisão humana de nomenclatura em cada entrada**. Revise os termos antes de usar em material acadêmico formal. O nome original em inglês é mantido e pode ser pesquisado.

## Créditos e licenças
O modelo 3D é do projeto Écorché, de Charleeh, sob CC BY-SA 4.0. É baseado em BodyParts3D © The Database Center for Life Science (CC BY 4.0) e Z-Anatomy, de Gauthier Kervyn (CC BY-SA 4.0). O modelo derivado permanece sob CC BY-SA 4.0; mantenha estes créditos se redistribuir o projeto ou o modelo. Consulte também o repositório original: https://github.com/Charleeh/ecorche

O modelo é uma ferramenta de visualização educacional, não um dispositivo médico. Representa um adulto masculino e não inclui órgãos, vasos, nervos ou ligamentos.


## Visualização integrada

A aba **Sistema integrado** exibe musculatura e esqueleto simultaneamente. Use as caixas de seleção para ocultar ou mostrar cada sistema e comparar a relação entre músculos e ossos.
