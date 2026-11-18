# Descubra Passos — mapa turístico 3D

Site estático com o mapa de Passos (MG) e região: pontos turísticos, trilhas, hotéis e restaurantes.
Quando você clica num local, a câmera aproxima e mostra o lugar em 3D, com relevo em escala real, imagem de satélite e prédios extrudados.

- **Estruturas** (igrejas, restaurantes, hotéis): o prédio fica destacado em 3D e a câmera gira em volta dele.
- **Trilhas**: o percurso aparece sobre o relevo. O painel mostra distância, ganho de elevação, dificuldade e perfil altimétrico, todos calculados a partir do modelo de terreno. O botão "Sobrevoar" percorre a trilha com a câmera.
- **Modo 3D realista** (opcional): modelos fotorrealistas do Google, abertos com CesiumJS. Veja abaixo.
- **Painel de informações**: descrição, história, endereço, horário, telefone, site, rota no Google Maps e link direto (`index.html#id-do-local`).

## Como rodar

Não precisa de build. Sirva a pasta com qualquer servidor estático:

```bash
python -m http.server 8000
# abra http://localhost:8000
```

Para publicar sem custo, envie a pasta para o GitHub Pages (ou Netlify ou Cloudflare Pages, no plano gratuito). Veja a seção de custos abaixo.

## Modo 3D realista (Google Photorealistic 3D Tiles)

O mapa padrão monta o 3D com relevo, satélite e prédios em forma de bloco. Para ver a fotogrametria do Google (prédios, árvores e terreno com textura real):

1. Crie uma conta gratuita em <https://ion.cesium.com> (não pede cartão).
2. Em **Access Tokens**, copie o token padrão.
3. Cole o token em `js/config.js`, no campo `cesiumIonToken`.
4. Ainda em **Access Tokens**, edite o token e preencha **Allowed URLs** com o endereço do site publicado. O token fica visível no código da página, e isso impede que outros sites gastem a sua cota.

Use só a conta gratuita (Community), sem cadastrar cartão. Se a cota do mês acabar, o modo realista para de carregar até o mês seguinte, e o resto do site continua funcionando.

O botão **"Ver em 3D realista"** passa a aparecer no painel de cada local. Se aparecer erro de permissão, abra o **Asset Depot** do Cesium ion e adicione "Google Photorealistic 3D Tiles" aos seus assets.

A fotogrametria detalhada do Google cobre principalmente cidades maiores. Onde não há cobertura, o modo realista mostra terreno e imagem do Google em resolução menor.

## Visual

A paleta vem da paisagem da região: o verde-azulado do lago de Furnas (botões e água), o verde do cerrado (trilhas), o dourado do capim-dourado da Canastra (seleção), o azul das barras das igrejas mineiras (passeios), o vermelho do café maduro (onde comer) e o lilás do quartzito (hospedagem). As cores ficam em variáveis no início de `css/style.css`; as do mapa ficam em `estilizarMapaBase()` e em `CATEGORIAS`, em `js/app.js`.

A tipografia é a Archivo, numa largura mais estreita nos títulos.

## Estrutura

```
index.html        página
vendor/           cópia da biblioteca MapLibre (o site não depende de CDN para o mapa)
css/style.css     visual (desktop e celular)
js/config.js      token do modo 3D realista
js/app.js         mapa, câmera, painel, altimetria
js/realista.js    modo 3D realista (CesiumJS, carregado só quando usado)
data/locais.js    base de dados dos locais  ← é aqui que se edita o conteúdo
```

## Trilhas

As trilhas cadastradas usam traçados reais do OpenStreetMap. Os circuitos do Complexo do Trovão e da Cachoeira do Barulho foram roteados a pé (Valhalla) sobre os caminhos mapeados, ligando os pontos reais de cada cachoeira e mirante.

Elas ficam nos municípios vizinhos de **São João Batista do Glória** e **Delfinópolis**, a 26–31 km de Passos, na região da Serra da Canastra. Esse é o destino de ecoturismo de quem está em Passos. Dentro do município de Passos não há trilhas mapeadas no OpenStreetMap.

| Trilha | Município | Extensão (ida) |
|---|---|---|
| Complexo do Trovão e Patinho-Feio | S. J. B. do Glória | 1,6 km |
| Cachoeira do Barulho | S. J. B. do Glória | 2,1 km |
| Morro da Cruz | Delfinópolis | 1,1 km |
| Cachoeira Maria Augusta (acesso) | S. J. B. do Glória | 0,3 km |
| Cachoeira do Filó (acesso) | S. J. B. do Glória | 0,25 km |
| Cachoeira do Quilombo | Delfinópolis | 0,6 km |

O tempo médio é estimado a 2,5 km/h (ida e volta). Distância, ganho de elevação e dificuldade são calculados no navegador a partir do relevo. Antes de divulgar, vale confirmar o acesso de cada trilha com guias locais, porque algumas áreas da região são particulares ou cobram entrada.

Para adicionar uma trilha a partir de um GPX (Wikiloc, Strava): abra o arquivo em <https://geojson.io>, copie as `coordinates` da LineString e cole em `trilha.percurso`.

## Editando os locais

Cada local é um objeto em `data/locais.js`. Campos com `null` aparecem como "A confirmar" no site.

- `coords`: `[longitude, latitude]`. O Google Maps mostra `latitude, longitude`, então inverta a ordem.
- `contorno` / `altura`: polígono do prédio destacado em 3D (contornos do OpenStreetMap; alturas estimadas).
- `municipio` / `distanciaPassos`: para atrativos fora da cidade.

### De onde vieram os dados

A base tem 85 lugares (17 passeios, 7 trilhas, 18 hospedagens e 43 lugares para comer), reunidos em novembro de 2026. Cada lugar lista as suas fontes no fim do painel:

- **OpenStreetMap**: posição exata de igrejas, praças, restaurantes, lanchonetes, sorveterias, cachoeiras e campings, além dos traçados das trilhas.
- **Diretórios e guias** (Guia Telefone, Transportal, Bendito Guia, ClickDisk, Buser, Hotels.com e blogs de viagem): telefones, endereços, horários e descrições.
- **Instagram dos estabelecimentos**: horário e contato do Villa Oba e da Lanchonete do Bolinha.

Os lugares que só tinham endereço foram posicionados pela numeração da rua e marcados com `localizacao: "aproximada"`. O site avisa no painel e, nesses casos, o botão "Como chegar" busca pelo endereço escrito. Nos testes, o erro dessa estimativa ficou entre 26 e 142 m.

### Fotos

19 fotos de 10 lugares vêm do [Wikimedia Commons](https://commons.wikimedia.org), o acervo de imagens livres da Wikipédia. Foram escolhidas uma a uma, conferindo se mostram o lugar de fato (pela localização e pelo conteúdo da foto). Elas não ficam no projeto: o navegador baixa a versão pequena (500 px) só quando o lugar é aberto, e a grande (960 px) só ao tocar na foto.

As licenças (CC BY e CC BY-SA) permitem o uso gratuito, mas exigem o crédito ao autor. O site mostra nome do autor, licença e link para a página original embaixo de cada foto: não remova esse crédito.

Para adicionar uma foto: encontre a imagem no Commons, abra a página dela e copie o endereço da miniatura de 500 px e o de 960 px (botão "Usar este arquivo" ou o link de outra resolução). Depois inclua no campo `fotos` do lugar em `data/locais.js`, seguindo o formato dos que já existem. Fotos próprias também servem: coloque o arquivo numa pasta `fotos/` do projeto e use o caminho relativo (`fotos/nome.jpg`) nos dois campos.

Os lugares sem foto livre (a maioria dos restaurantes e hotéis) têm o botão "Ver fotos no Google Maps", que abre a busca do lugar no Google Maps. É só um link, sem chave nem custo.

### Pendências de conteúdo

- Telefones e horários vêm de diretórios que podem estar desatualizados: confirme antes de divulgar.
- Muitas lanchonetes e sorveterias do OpenStreetMap não têm telefone nem horário.
- Não foi possível localizar o Teatro Rotary, a Avenida da Moda, o Museu da Cultura, o Hotel Vale das Águas (Rodovia MG-050, 618) e o Hotel Fazenda Haras Eldorado, então eles ficaram fora do mapa.
- As datas da Igreja Matriz e do Santuário da Penha divergem entre as fontes; confirme com as paróquias.

## Custos: tudo gratuito, sem cartão

O projeto foi montado para nunca gerar cobrança. Nenhum serviço usado pede cartão de crédito, então não existe conta que possa ser cobrada, nem depois de anos.

| O quê | Fonte | Cadastro | Por que não gera cobrança |
|---|---|---|---|
| Biblioteca de mapa | MapLibre GL JS 4.7.1, cópia em `vendor/` | não | Código aberto (licença BSD), servido pelo próprio site |
| Mapa base e prédios | OpenFreeMap (dados OpenStreetMap) | não | Serviço público mantido por doações, sem contas nem limites pagos |
| Relevo | AWS Terrain Tiles | não | Conjunto de dados público do programa Open Data da AWS, pago pela própria AWS |
| Satélite | Esri World Imagery | não | Acesso público sem chave; não há conta a cobrar |
| Fonte (Archivo) | Google Fonts | não | Gratuito, licença aberta (OFL) |
| 3D realista (opcional) | CesiumJS 1.144 + Cesium ion | conta gratuita, sem cartão | No plano Community, a cota acaba em vez de cobrar |
| Hospedagem | GitHub Pages, Netlify ou Cloudflare Pages | conta gratuita | Planos gratuitos para sites estáticos; use o endereço gratuito (ex.: `usuario.github.io`) em vez de comprar um domínio |

Regras para manter assim:

- **Não use chave do Google Maps Platform.** O código não tem mais essa opção porque ela exige faturamento ativo e cobra ao passar da cota gratuita.
- **Não cadastre cartão** no Cesium ion nem no serviço de hospedagem.
- **Mantenha o uso não comercial.** Os planos gratuitos do Cesium ion e o acesso à imagem da Esri valem para projetos não comerciais como este.
- **Não compre domínio**, que é a única despesa comum em sites. O endereço gratuito da hospedagem funciona igual.

O risco de longo prazo não é cobrança, e sim um serviço gratuito sair do ar. Por isso a biblioteca do mapa fica dentro do projeto. Se o OpenFreeMap, o relevo da AWS ou a imagem da Esri deixarem de funcionar, basta trocar a URL correspondente em `js/app.js`; o site continua mostrando lista, busca e detalhes dos lugares.

As atribuições aparecem no canto do mapa e precisam ser mantidas.
