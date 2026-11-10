/*
 * Base de dados dos locais exibidos no mapa.
 *
 * Reunida em nov/2026 a partir do OpenStreetMap e de guias e diretórios na web
 * (lista em "fontes" de cada lugar). Telefones, horários e endereços vêm desses
 * diretórios e podem estar desatualizados: confirme antes de publicar.
 * Campos ausentes aparecem no site como "A confirmar".
 *
 * Campos:
 *   id, nome, categoria ("turismo" | "trilha" | "hotel" | "restaurante")
 *   coords: [longitude, latitude]
 *   localizacao: "aproximada" quando o ponto foi estimado pelo endereço (rua e número),
 *     e não marcado no mapa; o erro típico é de um quarteirão
 *   contorno: polígono da estrutura (OpenStreetMap) destacado em 3D; altura em metros (estimada)
 *   descricao, historia, endereco, telefone, site, instagram, horario
 *   tags: lista curta exibida como etiquetas
 *   fontes: de onde vieram as informações
 *   trilha (só para categoria "trilha"): { percurso: [[lng,lat],...], tempoMedio, pontos (atrativos no caminho) }
 *   municipio, distanciaPassos: para lugares fora da cidade
 */
window.LOCAIS = [
  // ---------- Passeios (17) ----------
  {
    id: "matriz-bom-jesus",
    nome: "Igreja Matriz Senhor Bom Jesus dos Passos",
    categoria: "turismo",
    coords: [-46.61045,-20.7194],
    altura: 18,
    contorno: [[-46.61048,-20.719035],[-46.610232,-20.719699],[-46.610428,-20.719763],[-46.610675,-20.719099],[-46.61048,-20.719035]],
    descricao: "Principal templo católico da cidade e marco de sua fundação. Tem duas torres frontais com relógios mecânicos, e o interior tem pinturas policromadas atribuídas a Jerônimo Neto, inspiradas na pintura renascentista.",
    historia: "No início do século XIX foi erguida uma capela dedicada ao Senhor Bom Jesus dos Passos, por João Pimenta de Abreu e Domingos Barbosa Passos. O povoado cresceu ao seu redor e herdou o nome do padroeiro, depois abreviado para \"Passos\". A freguesia foi elevada a vila em 1848. As datas de construção da igreja atual variam entre as fontes consultadas (1823–1834, 1840, 1865–1875); confirme com a paróquia.",
    endereco: "Praça Monsenhor Messias Bragança, Centro",
    tags: ["Patrimônio religioso", "História", "Centro"],
    fontes: ["Jorge Paiva Imóveis (2021)", "OpenStreetMap", "Revista do CRC-MG", "TJMG", "Temporada Livre (2024)", "Vai de Promo (2023)"]
  },
  {
    id: "praca-matriz",
    nome: "Praça Monsenhor Messias Bragança",
    categoria: "turismo",
    coords: [-46.61076,-20.71854],
    altura: 0.6,
    contorno: [[-46.6105,-20.717966],[-46.610173,-20.718839],[-46.611052,-20.719104],[-46.611346,-20.718315],[-46.611342,-20.718276],[-46.611313,-20.718227],[-46.6105,-20.717966]],
    descricao: "Praça em frente à Igreja Matriz, ponto de encontro tradicional do centro e cenário das festas religiosas da cidade.",
    endereco: "Centro",
    horario: "Aberta 24 horas",
    tags: ["Praça", "Centro"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "matriz-aparecida",
    nome: "Igreja Matriz de Nossa Senhora Aparecida",
    categoria: "turismo",
    coords: [-46.60596,-20.71153],
    altura: 16,
    contorno: [[-46.605674,-20.71129],[-46.605912,-20.711177],[-46.606252,-20.711753],[-46.606022,-20.711874],[-46.605674,-20.71129]],
    descricao: "Igreja matriz católica dedicada a Nossa Senhora Aparecida.",
    endereco: "Praça Nossa Senhora Aparecida",
    tags: ["Patrimônio religioso"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "capela-penha",
    nome: "Santuário e Capela de Nossa Senhora da Penha",
    categoria: "turismo",
    coords: [-46.62633,-20.71564],
    altura: 9,
    contorno: [[-46.626504,-20.715487],[-46.626122,-20.715542],[-46.626162,-20.715796],[-46.626538,-20.715761],[-46.626504,-20.715487]],
    descricao: "Santuário de granito em estilo art déco, com abóbadas prateadas e azulejos que contam histórias bíblicas. Foi construído para ampliar a antiga Capelinha da Penha e é a segunda paróquia da cidade. Aberto à visitação, com missas.",
    historia: "Idealizado pelo Monsenhor Matias para ampliar a antiga Capelinha da Penha, que, segundo as fontes, tem mais de 200 anos. As datas da obra divergem: uma fonte fala em construção em 1947, outra em obra iniciada em 1964 e concluída cerca de 20 anos depois, e outra situa a capela original no século XIX. Confirme com a paróquia.",
    endereco: "Praça da Capela",
    tags: ["Patrimônio religioso", "Art déco"],
    fontes: ["Jorge Paiva Imóveis (2021)", "OpenStreetMap", "Temporada Livre (2024)", "Transportal (2022)", "Vai de Promo (2023)"]
  },
  {
    id: "igreja-sao-francisco",
    nome: "Igreja São Francisco",
    categoria: "turismo",
    coords: [-46.61784,-20.72431],
    descricao: "Igreja católica junto à Praça São Francisco.",
    endereco: "Rua Santa Luzia",
    tags: ["Patrimônio religioso"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "praca-geraldo-maia",
    nome: "Praça Geraldo da Silva Maia",
    categoria: "turismo",
    coords: [-46.60922,-20.72188],
    descricao: "Praça arborizada na região central, cercada por comércio e lanchonetes.",
    endereco: "Centro",
    horario: "Aberta 24 horas",
    tags: ["Praça", "Centro"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "parque-exposicoes",
    nome: "Parque de Exposições Adolfo Coelho",
    categoria: "turismo",
    coords: [-46.60724,-20.73459],
    altura: 8,
    contorno: [[-46.607544,-20.734102],[-46.607661,-20.734189],[-46.607804,-20.734305],[-46.607868,-20.734421],[-46.607895,-20.734541],[-46.607873,-20.734627],[-46.607812,-20.734748],[-46.607731,-20.734811],[-46.607671,-20.734862],[-46.607555,-20.734885],[-46.607411,-20.734848],[-46.607339,-20.734804],[-46.606996,-20.73445],[-46.606974,-20.734365],[-46.607011,-20.734224],[-46.607047,-20.734146],[-46.607112,-20.734085],[-46.607231,-20.734018],[-46.607335,-20.733998],[-46.6074,-20.734012],[-46.607473,-20.734046],[-46.607544,-20.734102]],
    descricao: "Recinto de exposições agropecuárias, rodeios e grandes eventos da cidade.",
    horario: "Conforme programação de eventos",
    tags: ["Eventos", "Cultura"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "parque-sabia",
    nome: "Parque Sabiá",
    categoria: "turismo",
    coords: [-46.61325,-20.73656],
    descricao: "Área verde urbana para caminhada e lazer ao ar livre.",
    tags: ["Natureza", "Lazer"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "estacao-cultura",
    nome: "Estação Cultura",
    categoria: "turismo",
    coords: [-46.61108,-20.708083],
    localizacao: "aproximada",
    descricao: "Antiga estação ferroviária, reformada, que abriga o Museu Municipal e o Centro de Memória. O acervo reúne quadros, objetos de época, obras de artistas da região, maquetes das igrejas, um projetor de cinema francês, jornais, revistas e discos. Recebe shows, blocos de carnaval e o Piquenique da Estação, evento com música e oficinas que reúne milhares de pessoas.",
    historia: "Inaugurada em 1921 como estação ferroviária da Mogiana.",
    endereco: "Rua da Mogiana, 194 a 234, Coimbras",
    tags: ["Museu", "Cultura", "Eventos"],
    fontes: ["Vai de Promo (2023)", "Transportal (2022)", "Temporada Livre (2024)", "Buser"]
  },
  {
    id: "mercado-municipal",
    nome: "Mercado Municipal de Passos",
    categoria: "turismo",
    coords: [-46.61309,-20.72091],
    descricao: "Mercado municipal no centro da cidade.",
    tags: ["Mercado", "Centro"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "cine-roxy",
    nome: "Cine Roxy",
    categoria: "turismo",
    coords: [-46.61108,-20.71787],
    descricao: "Cinema ao lado da praça da Igreja Matriz.",
    tags: ["Cinema", "Cultura"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "porto-passos",
    nome: "Porto Passos-Glória",
    categoria: "turismo",
    coords: [-46.536922,-20.661702],
    localizacao: "aproximada",
    descricao: "Área às margens do Lago de Furnas, o \"mar de Minas\", a cerca de 9 km do centro. Lugar para ver o pôr do sol e praticar esportes náuticos.",
    tags: ["Lago de Furnas", "Pôr do sol", "Esportes náuticos"],
    fontes: ["Jorge Paiva Imóveis (2021)", "Vai de Promo (2023)", "OpenStreetMap"]
  },
  {
    id: "cachoeira-vale-do-ceu",
    nome: "Cachoeira Vale do Céu",
    categoria: "turismo",
    coords: [-46.5294,-20.49592],
    municipio: "Delfinópolis",
    distanciaPassos: "26 km",
    descricao: "Cachoeira na região de Delfinópolis, no limite da Serra da Canastra.",
    endereco: "Zona rural de Delfinópolis",
    tags: ["Cachoeira"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "cachoeira-tamandua",
    nome: "Cachoeira Tamanduá",
    categoria: "turismo",
    coords: [-46.49931,-20.51983],
    municipio: "São João Batista do Glória",
    distanciaPassos: "25 km",
    descricao: "Cachoeira citada pelos guias entre os destinos de trilha da região de Glória.",
    endereco: "Zona rural de São João Batista do Glória",
    tags: ["Cachoeira"],
    fontes: ["OpenStreetMap", "Vai de Promo (2023)"]
  },
  {
    id: "cachoeira-do-fumal",
    nome: "Cachoeira do Fumal",
    categoria: "turismo",
    coords: [-46.39124,-20.54649],
    municipio: "São João Batista do Glória",
    distanciaPassos: "30 km",
    descricao: "Cachoeira na região das cachoeiras de Glória.",
    endereco: "Zona rural de São João Batista do Glória",
    tags: ["Cachoeira"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "cachoeira-pe-da-serra",
    nome: "Cachoeira Pé da Serra",
    categoria: "turismo",
    coords: [-46.32565,-20.62215],
    municipio: "São João Batista do Glória",
    distanciaPassos: "32 km",
    descricao: "Complexo de cachoeiras com pousada e camping, na região de Glória.",
    endereco: "Zona rural de São João Batista do Glória",
    tags: ["Cachoeira", "Camping"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "pedreira-lagoa-azul",
    nome: "Pedreira Lagoa Azul",
    categoria: "turismo",
    coords: [-46.3083,-20.60426],
    municipio: "São João Batista do Glória",
    distanciaPassos: "34 km",
    descricao: "Antiga pedreira com lagoa de água azul, na região de Glória.",
    endereco: "Zona rural de São João Batista do Glória",
    tags: ["Lagoa"],
    fontes: ["OpenStreetMap"]
  },

  // ---------- Trilhas (7) ----------
  {
    id: "trilha-trovao",
    nome: "Complexo do Trovão e Patinho-Feio",
    categoria: "trilha",
    coords: [-46.33324,-20.607426],
    municipio: "São João Batista do Glória",
    distanciaPassos: "31 km",
    descricao: "Circuito curto que liga uma sequência de quedas e poços: Cachoeira do Trovão, Poço do Patinho-Feio, o topo do Patinho-Feio (mirante), Cachoeira da Gemia e Cachoeira do Pulo. Traçado montado sobre os caminhos mapeados no OpenStreetMap.",
    endereco: "Zona rural de São João Batista do Glória (a ~31 km de Passos em linha reta)",
    tags: ["Cachoeiras", "Mirante", "Poços"],
    fontes: ["OpenStreetMap"],
    trilha: {
      tempoMedio: "1 h 20 min (ida e volta)",
      pontos: ["Cachoeira do Trovão", "Poço do Patinho-Feio", "Topo do Patinho-Feio", "Cachoeira da Gemia", "Cachoeira do Pulo"],
      percurso: [
        [-46.33324,-20.607426], [-46.333362,-20.607505], [-46.33366,-20.607248], [-46.33381,-20.607215], [-46.333873,-20.607035],
        [-46.33378,-20.607003], [-46.333746,-20.606634], [-46.33378,-20.607003], [-46.333873,-20.607035], [-46.333841,-20.607158],
        [-46.33381,-20.607215], [-46.333592,-20.607294], [-46.333362,-20.607505], [-46.33356,-20.607736], [-46.333766,-20.607881],
        [-46.333828,-20.608031], [-46.333996,-20.608091], [-46.334198,-20.608014], [-46.334772,-20.60725], [-46.334864,-20.607191],
        [-46.335044,-20.607148], [-46.335221,-20.607017], [-46.335389,-20.606819], [-46.335538,-20.606349], [-46.335562,-20.606213],
        [-46.335515,-20.605921], [-46.335255,-20.605794], [-46.335221,-20.605691], [-46.334999,-20.605637], [-46.33473,-20.605692],
        [-46.334667,-20.605665], [-46.334677,-20.605545], [-46.334533,-20.605444], [-46.334484,-20.605328], [-46.334533,-20.605444],
        [-46.334677,-20.605545], [-46.334667,-20.605665], [-46.33473,-20.605692], [-46.334999,-20.605637], [-46.335221,-20.605691],
        [-46.335397,-20.604542], [-46.335408,-20.60423], [-46.33552,-20.603996], [-46.335255,-20.603733], [-46.335096,-20.603512],
        [-46.33509,-20.603401], [-46.33526,-20.602597], [-46.335385,-20.602404], [-46.335579,-20.60231], [-46.335635,-20.602225],
        [-46.335622,-20.602062], [-46.33554,-20.60192], [-46.33544,-20.600973], [-46.33521,-20.600968], [-46.335118,-20.600934],
        [-46.335066,-20.60085], [-46.335159,-20.600712], [-46.335049,-20.600671], [-46.334956,-20.600648], [-46.33484,-20.6007],
        [-46.33473,-20.600701], [-46.33458,-20.600636], [-46.334554,-20.600671]
      ]
    }
  },
  {
    id: "trilha-barulho",
    nome: "Trilha da Cachoeira do Barulho",
    categoria: "trilha",
    coords: [-46.420159,-20.52938],
    municipio: "São João Batista do Glória",
    distanciaPassos: "29 km",
    descricao: "Caminhada por trilha de terra até a Cachoeira do Barulho, na região das cachoeiras de Glória, ao pé da Serra da Canastra.",
    endereco: "Zona rural de São João Batista do Glória (a ~29 km de Passos em linha reta)",
    tags: ["Cachoeira"],
    fontes: ["OpenStreetMap"],
    trilha: {
      tempoMedio: "1 h 40 min (ida e volta)",
      pontos: ["Cachoeira do Barulho"],
      percurso: [
        [-46.420159,-20.52938], [-46.419618,-20.529667], [-46.419406,-20.529848], [-46.419079,-20.530739], [-46.418899,-20.531061],
        [-46.418701,-20.531285], [-46.418143,-20.531664], [-46.416944,-20.532601], [-46.416236,-20.533402], [-46.416107,-20.533475],
        [-46.415756,-20.533377], [-46.415547,-20.533505], [-46.41541,-20.533852], [-46.415509,-20.53397], [-46.415522,-20.534171],
        [-46.415439,-20.534276], [-46.415222,-20.534341], [-46.415045,-20.535266], [-46.414468,-20.535871], [-46.413374,-20.53664],
        [-46.41328,-20.536592], [-46.413192,-20.536193], [-46.413015,-20.53609], [-46.412803,-20.536034], [-46.412618,-20.536137],
        [-46.412304,-20.536421], [-46.412154,-20.53672], [-46.412135,-20.536883], [-46.411985,-20.537094], [-46.411942,-20.537303],
        [-46.411813,-20.537536], [-46.411602,-20.537777], [-46.411458,-20.537689], [-46.411111,-20.537874], [-46.410957,-20.537807],
        [-46.410455,-20.537708], [-46.409542,-20.537647], [-46.408364,-20.538249], [-46.407916,-20.538413], [-46.407857,-20.538483],
        [-46.407296,-20.538813], [-46.407153,-20.539337], [-46.40716,-20.539457], [-46.40726,-20.539697], [-46.407279,-20.539855],
        [-46.407253,-20.539905]
      ]
    }
  },
  {
    id: "trilha-morro-cruz",
    nome: "Trilha para o Morro da Cruz",
    categoria: "trilha",
    coords: [-46.544651,-20.48406],
    municipio: "Delfinópolis",
    distanciaPassos: "27 km",
    descricao: "Subida por trilha até o Morro da Cruz, com vista para os vales da região. Trilha registrada com esse nome no OpenStreetMap.",
    endereco: "Zona rural de Delfinópolis (a ~27 km de Passos em linha reta)",
    tags: ["Mirante", "Subida"],
    fontes: ["OpenStreetMap"],
    trilha: {
      tempoMedio: "55 min (ida e volta)",
      pontos: ["Morro da Cruz"],
      percurso: [
        [-46.544651,-20.48406], [-46.545059,-20.483771], [-46.545519,-20.484069], [-46.545846,-20.484054], [-46.54662,-20.483701],
        [-46.547089,-20.483672], [-46.547441,-20.483757], [-46.547575,-20.484009], [-46.547961,-20.484361], [-46.548209,-20.48448],
        [-46.548363,-20.484501], [-46.54852,-20.484601], [-46.548858,-20.484663], [-46.548892,-20.484845], [-46.548967,-20.484851],
        [-46.548957,-20.484883], [-46.549032,-20.484909], [-46.549239,-20.485196], [-46.549345,-20.485274], [-46.549343,-20.485361],
        [-46.549424,-20.485439], [-46.549385,-20.485479], [-46.549408,-20.485663], [-46.549508,-20.485765], [-46.549583,-20.485773],
        [-46.549596,-20.485824], [-46.549829,-20.48593], [-46.550015,-20.485939], [-46.550278,-20.486097], [-46.550493,-20.48616],
        [-46.550743,-20.486418], [-46.550941,-20.486559], [-46.551119,-20.486762], [-46.551383,-20.487346], [-46.551495,-20.487454],
        [-46.551517,-20.487531], [-46.551501,-20.487602], [-46.551209,-20.487642], [-46.551005,-20.487801], [-46.550882,-20.487831],
        [-46.550715,-20.487764], [-46.550738,-20.487651], [-46.550606,-20.487581], [-46.550522,-20.487579], [-46.550445,-20.487629],
        [-46.550264,-20.487545]
      ]
    }
  },
  {
    id: "trilha-maria-augusta",
    nome: "Acesso à Cachoeira Maria Augusta",
    categoria: "trilha",
    coords: [-46.518054,-20.502629],
    municipio: "São João Batista do Glória",
    distanciaPassos: "26 km",
    descricao: "Trecho final a pé até a Cachoeira Maria Augusta, uma das quedas mais visitadas da região. A partir de Passos, o trajeto é feito de carro por estrada de terra (há roteiro off-road com partida em Passos no Wikiloc).",
    endereco: "Fazenda Maria Augusta, zona rural de São João Batista do Glória. Acesso por estrada de terra sinalizada a partir da MG-050, cerca de 19 km da cidade de Glória",
    telefone: "(35) 99811-4272",
    site: "https://www.wikiloc.com/offroading-trails/cachoeira-maria-augusta-com-partida-em-passos-172438756",
    tags: ["Cachoeira", "Camping próximo"],
    fontes: ["Buser", "OpenStreetMap", "Travel.com.br"],
    trilha: {
      tempoMedio: "15 min (ida e volta)",
      pontos: ["Cachoeira Maria Augusta"],
      percurso: [
        [-46.518054,-20.502629], [-46.518201,-20.502337], [-46.518345,-20.502249], [-46.518632,-20.502234], [-46.518935,-20.502283],
        [-46.519351,-20.502187], [-46.51942,-20.502368], [-46.519605,-20.502443], [-46.519706,-20.502414], [-46.519792,-20.502361],
        [-46.52017,-20.50183]
      ]
    }
  },
  {
    id: "trilha-file",
    nome: "Acesso à Cachoeira do Filó",
    categoria: "trilha",
    coords: [-46.321052,-20.646393],
    municipio: "São João Batista do Glória",
    distanciaPassos: "31 km",
    descricao: "Caminho curto até a Cachoeira do Filó, de águas cristalinas, próxima ao Camping Quebra Anzol.",
    endereco: "Às margens da MG-050, km 300, São João Batista do Glória. Há estacionamento no início da trilha",
    tags: ["Cachoeira"],
    fontes: ["Jorge Paiva Imóveis (2021)", "Mochileiros.com", "OpenStreetMap"],
    trilha: {
      tempoMedio: "10 min (ida e volta)",
      pontos: ["Cachoeira do Filó"],
      percurso: [
        [-46.321052,-20.646393], [-46.321093,-20.64684], [-46.321064,-20.646968], [-46.321212,-20.647337], [-46.321331,-20.64722],
        [-46.321693,-20.647026], [-46.321965,-20.646943], [-46.322007,-20.646791], [-46.322096,-20.646706], [-46.32232,-20.64672]
      ]
    }
  },
  {
    id: "trilha-quilombo",
    nome: "Trilha da Cachoeira do Quilombo",
    categoria: "trilha",
    coords: [-46.468748,-20.479236],
    municipio: "Delfinópolis",
    distanciaPassos: "30 km",
    descricao: "Trilha até a Cachoeira do Quilombo, em Delfinópolis, no limite da Serra da Canastra.",
    endereco: "Zona rural de Delfinópolis (a ~30 km de Passos em linha reta)",
    tags: ["Cachoeira"],
    fontes: ["OpenStreetMap", "Travel.com.br"],
    trilha: {
      tempoMedio: "30 min (ida e volta)",
      pontos: ["Cachoeira do Quilombo"],
      percurso: [
        [-46.468748,-20.479236], [-46.468711,-20.479823], [-46.470846,-20.479653], [-46.471463,-20.480572], [-46.472063,-20.481231],
        [-46.47172,-20.48179]
      ]
    }
  },
  {
    id: "trilha-paraiso-perdido",
    nome: "Trilha da Cachoeira Paraíso Perdido",
    categoria: "trilha",
    coords: [-46.326046,-20.621646],
    municipio: "São João Batista do Glória",
    distanciaPassos: "32 km",
    descricao: "Trilha até a Cachoeira Paraíso Perdido, citada entre os pontos mais visitados de São João Batista do Glória. Traçado montado sobre os caminhos mapeados no OpenStreetMap.",
    endereco: "Zona rural de São João Batista do Glória",
    tags: ["Cachoeira"],
    fontes: ["OpenStreetMap", "Travel.com.br"],
    trilha: {
      tempoMedio: "1 h (ida e volta)",
      pontos: ["Cachoeira Paraíso Perdido"],
      percurso: [
        [-46.326046,-20.621646], [-46.325863,-20.621433], [-46.325914,-20.621325], [-46.325882,-20.621217], [-46.325773,-20.621143],
        [-46.325584,-20.621032], [-46.325497,-20.621108], [-46.325361,-20.621275], [-46.32508,-20.621347], [-46.324939,-20.62131],
        [-46.324641,-20.621129], [-46.324398,-20.620904], [-46.324279,-20.620793], [-46.32415,-20.620784], [-46.324083,-20.620834],
        [-46.324016,-20.620883], [-46.323779,-20.620837], [-46.32361,-20.620997], [-46.323383,-20.621471], [-46.323248,-20.621476],
        [-46.323206,-20.621478], [-46.323084,-20.62193], [-46.323063,-20.622037], [-46.32303,-20.622206], [-46.322845,-20.622507],
        [-46.322675,-20.622788], [-46.322549,-20.622939], [-46.322406,-20.623101], [-46.322377,-20.623134], [-46.322387,-20.623395],
        [-46.322568,-20.623459], [-46.322674,-20.623535], [-46.322717,-20.623567], [-46.322772,-20.623735], [-46.322879,-20.623883],
        [-46.322978,-20.623913], [-46.323084,-20.623942], [-46.323173,-20.623981], [-46.323328,-20.624151], [-46.323398,-20.624303],
        [-46.323314,-20.624371], [-46.323293,-20.624388], [-46.323472,-20.624871], [-46.323649,-20.624969], [-46.323905,-20.625144],
        [-46.324156,-20.625349], [-46.324258,-20.625462], [-46.324547,-20.625601], [-46.32463,-20.625649], [-46.324616,-20.625783],
        [-46.324534,-20.625923], [-46.32457,-20.626112], [-46.324614,-20.626146], [-46.324689,-20.626148], [-46.324716,-20.626083],
        [-46.324755,-20.626042], [-46.324781,-20.626064], [-46.324805,-20.626202], [-46.324853,-20.626205], [-46.324893,-20.626206],
        [-46.324984,-20.626272], [-46.324996,-20.626443], [-46.32481,-20.62661]
      ]
    }
  },

  // ---------- Hospedagem (18) ----------
  {
    id: "hotel-maldi",
    nome: "Hotel Maldi",
    categoria: "hotel",
    coords: [-46.60704,-20.72193],
    altura: 8,
    contorno: [[-46.607079,-20.722006],[-46.607042,-20.72184],[-46.607006,-20.721847],[-46.607044,-20.722013],[-46.607079,-20.722006]],
    descricao: "Hotel na região central, próximo à Praça Geraldo da Silva Maia.",
    endereco: "Avenida Expedicionários, 107, Centro",
    telefone: "(35) 3521-6603",
    horario: "Recepção: a confirmar",
    tags: ["Centro"],
    fontes: ["Guia Telefone", "OpenStreetMap"]
  },
  {
    id: "class-hotel",
    nome: "Class Hotel Passos",
    categoria: "hotel",
    coords: [-46.606614,-20.733204],
    localizacao: "aproximada",
    descricao: "Hotel na avenida que liga o centro à saída para a MG-050.",
    endereco: "Avenida Comendador Francisco Avelino Maia, 3661, Belo Horizonte",
    telefone: "(35) 3526-8879 / (35) 3522-3333",
    tags: ["Hotel"],
    fontes: ["Guia Telefone", "Transportal (2022)"]
  },
  {
    id: "hotel-avenida",
    nome: "Hotel Avenida",
    categoria: "hotel",
    coords: [-46.61302,-20.715843],
    localizacao: "aproximada",
    endereco: "Avenida Comendador Francisco Avelino Maia, 2541, Centro",
    telefone: "(35) 3521-7693",
    tags: ["Hotel"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "hotel-cidade",
    nome: "Hotel Cidade",
    categoria: "hotel",
    coords: [-46.607249,-20.732534],
    localizacao: "aproximada",
    endereco: "Avenida Comendador Francisco Avelino Maia, 3560, Muarama",
    telefone: "(35) 3521-5588",
    tags: ["Hotel"],
    fontes: ["Guia Telefone", "Transportal (2022)"]
  },
  {
    id: "minas-palace",
    nome: "Minas Palace Hotel",
    categoria: "hotel",
    coords: [-46.604659,-20.732014],
    localizacao: "aproximada",
    endereco: "Avenida Juca Stockler, 835, Belo Horizonte (outra fonte indica Rua dos Funcionários, 355)",
    telefone: "(35) 3521-8555",
    tags: ["Hotel"],
    fontes: ["Guia Telefone", "Transportal (2022)"]
  },
  {
    id: "mariachis",
    nome: "Mariachis Hotel",
    categoria: "hotel",
    coords: [-46.603957,-20.734458],
    localizacao: "aproximada",
    endereco: "Avenida Juca Stockler, 551, Belo Horizonte",
    telefone: "(35) 3521-3022",
    tags: ["Hotel"],
    fontes: ["Guia Telefone", "Momondo"]
  },
  {
    id: "magnos",
    nome: "Magnos Hotel",
    categoria: "hotel",
    coords: [-46.604475,-20.732576],
    localizacao: "aproximada",
    endereco: "Avenida Juca Stockler, 770, Belo Horizonte",
    telefone: "(35) 3521-2027",
    tags: ["Hotel"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "constantino",
    nome: "Constantino Hotel",
    categoria: "hotel",
    coords: [-46.605753,-20.728582],
    localizacao: "aproximada",
    endereco: "Avenida Juca Stockler, 1495, Belo Horizonte",
    telefone: "(35) 3521-5708",
    tags: ["Hotel"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "hotel-mineirao",
    nome: "Hotel Mineirão",
    categoria: "hotel",
    coords: [-46.612836,-20.720921],
    localizacao: "aproximada",
    endereco: "Rua do Mercado, 71, Centro",
    telefone: "(35) 3521-7027",
    tags: ["Hotel", "Centro"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "hotel-mirador",
    nome: "Hotel Mirador",
    categoria: "hotel",
    coords: [-46.608988,-20.724608],
    localizacao: "aproximada",
    endereco: "Rua 7 de Setembro, 1388, Centro",
    telefone: "(35) 3521-2308",
    tags: ["Hotel", "Centro"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "araujos-suites",
    nome: "Hotel Araujo's Suítes",
    categoria: "hotel",
    coords: [-46.60183,-20.750023],
    localizacao: "aproximada",
    endereco: "Rua Professora Maria de Lourdes Santos Lemos, 162",
    tags: ["Suítes"],
    fontes: ["Hotels.com"]
  },
  {
    id: "hostel-passos",
    nome: "Pousada Hostel Passos",
    categoria: "hotel",
    coords: [-46.620855,-20.732241],
    localizacao: "aproximada",
    endereco: "Rua Pensilvânia, 103, Parque Residencial Eldorado",
    telefone: "(35) 99721-8626",
    tags: ["Hostel", "Pousada"],
    fontes: ["Transportal (2022)"]
  },
  {
    id: "presidente-hotel",
    nome: "Presidente Hotel",
    categoria: "hotel",
    coords: [-46.6108,-20.71851],
    localizacao: "aproximada",
    descricao: "Hotel na praça da Igreja Matriz.",
    endereco: "Praça Monsenhor Messias Bragança, 215, Centro",
    telefone: "(35) 3521-6388",
    tags: ["Hotel", "Centro"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "grande-hotel",
    nome: "Grande Hotel",
    categoria: "hotel",
    coords: [-46.61073,-20.71857],
    localizacao: "aproximada",
    descricao: "Hotel na praça da Igreja Matriz.",
    endereco: "Praça Monsenhor Messias Bragança, 26, Centro",
    telefone: "(35) 3521-8699",
    tags: ["Hotel", "Centro"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "hotel-tradicao",
    nome: "Hotel Tradição Municipal",
    categoria: "hotel",
    coords: [-46.61072,-20.71851],
    localizacao: "aproximada",
    descricao: "Hotel na praça da Igreja Matriz (também listado como Hotel Municipal).",
    endereco: "Praça Monsenhor Messias Bragança, 68, Centro",
    telefone: "(35) 3521-6193",
    tags: ["Hotel", "Centro"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "pouso-mineiro",
    nome: "Pousada Pouso Mineiro",
    categoria: "hotel",
    coords: [-46.506498,-20.630094],
    localizacao: "aproximada",
    municipio: "São João Batista do Glória",
    distanciaPassos: "15 km",
    descricao: "Pousada com café da manhã e área de lazer, na cidade que é a porta de entrada das cachoeiras da região.",
    endereco: "Rua Fortaleza, 20, São João Batista do Glória",
    telefone: "(35) 98408-0017",
    tags: ["Pousada", "Cachoeiras"],
    fontes: ["Transportal (2022)"]
  },
  {
    id: "camping-quebra-anzol",
    nome: "Camping Quebra Anzol",
    categoria: "hotel",
    coords: [-46.32396,-20.65636],
    municipio: "São João Batista do Glória",
    distanciaPassos: "31 km",
    descricao: "Área de camping perto da Cachoeira do Filó, na região das cachoeiras de Glória.",
    tags: ["Camping"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "camping-cocao",
    nome: "Camping Cocão",
    categoria: "hotel",
    coords: [-46.51132,-20.52139],
    municipio: "Delfinópolis",
    distanciaPassos: "24 km",
    descricao: "Área de camping perto da Cachoeira Maria Augusta.",
    tags: ["Camping"],
    fontes: ["OpenStreetMap"]
  },

  // ---------- Onde comer (43) ----------
  {
    id: "pintado-douro",
    nome: "Pintado D'Ouro",
    categoria: "restaurante",
    coords: [-46.61081,-20.72857],
    descricao: "Um dos restaurantes mais recomendados pelos moradores, conhecido pelos peixes, porções e pelo arroz verde cremoso.",
    tags: ["Peixes", "Porções"],
    fontes: ["Econodata", "Guias de viagem", "OpenStreetMap"]
  },
  {
    id: "barolo",
    nome: "Restaurante Barolo e Pizzaria Gepeto",
    categoria: "restaurante",
    coords: [-46.6106,-20.72315],
    altura: 8,
    contorno: [[-46.61073,-20.722937],[-46.610487,-20.722863],[-46.610415,-20.723073],[-46.610658,-20.723146],[-46.61073,-20.722937]],
    descricao: "Restaurante citado entre os mais conhecidos da cidade.",
    endereco: "Rua Elvira Silveira Coimbra, s/n, Centro",
    tags: ["Restaurante"],
    fontes: ["OpenStreetMap", "Transportal (2022)"]
  },
  {
    id: "churrascaria-gaucha",
    nome: "Churrascaria Gaúcha",
    categoria: "restaurante",
    coords: [-46.61004,-20.71801],
    altura: 8,
    contorno: [[-46.610235,-20.717867],[-46.61013,-20.718216],[-46.609855,-20.718144],[-46.609872,-20.718086],[-46.609906,-20.717972],[-46.609957,-20.717986],[-46.610011,-20.717808],[-46.610235,-20.717867]],
    descricao: "Churrascaria tradicional próxima à Igreja Matriz.",
    endereco: "Rua Doutor Bernardino Vieira, 42, Centro",
    telefone: "(35) 3521-8766",
    tags: ["Churrasco"],
    fontes: ["OpenStreetMap", "Transportal (2022)"]
  },
  {
    id: "pizzaria-carraro",
    nome: "Pizzaria Carraro",
    categoria: "restaurante",
    coords: [-46.61147,-20.7187],
    altura: 8,
    contorno: [[-46.611373,-20.718541],[-46.611637,-20.718619],[-46.611558,-20.71885],[-46.611294,-20.718772],[-46.611373,-20.718541]],
    descricao: "Pizzaria no centro da cidade.",
    tags: ["Pizza"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "kampai-ima",
    nome: "Kampai Ima",
    categoria: "restaurante",
    coords: [-46.61033,-20.7199],
    altura: 8,
    contorno: [[-46.610439,-20.719821],[-46.610289,-20.71978],[-46.61023,-20.719969],[-46.61038,-20.72001],[-46.610439,-20.719821]],
    descricao: "Restaurante de culinária japonesa.",
    endereco: "Travessa Monsenhor João Pedro, 111, Centro",
    telefone: "(35) 3522-7750",
    tags: ["Japonesa"],
    fontes: ["OpenStreetMap", "Transportal (2022)"]
  },
  {
    id: "emporio-cafeteria",
    nome: "Empório Cafeteria",
    categoria: "restaurante",
    coords: [-46.61027,-20.71903],
    altura: 8,
    contorno: [[-46.610309,-20.718993],[-46.610261,-20.71898],[-46.610236,-20.719058],[-46.610285,-20.719071],[-46.610309,-20.718993]],
    descricao: "Cafeteria ao lado da Igreja Matriz.",
    tags: ["Café"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "pizzaretto",
    nome: "Pizzaretto",
    categoria: "restaurante",
    coords: [-46.60926,-20.72279],
    altura: 8,
    contorno: [[-46.609363,-20.722648],[-46.60929,-20.722632],[-46.609257,-20.722763],[-46.609334,-20.722774],[-46.609363,-20.722648]],
    descricao: "Restaurante, pizzaria e chopperia.",
    endereco: "Rua Elvira Silveira Coimbra, 123, Centro",
    telefone: "(35) 3526-5303",
    tags: ["Pizza", "Chopp"],
    fontes: ["ClickDisk", "OpenStreetMap"]
  },
  {
    id: "tudo-no-espeto",
    nome: "Tudo no Espeto",
    categoria: "restaurante",
    coords: [-46.61021,-20.72912],
    descricao: "Espetinhos e petiscos.",
    tags: ["Espetinho"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "vitale-grill",
    nome: "Vitale Grill",
    categoria: "restaurante",
    coords: [-46.608848,-20.720402],
    localizacao: "aproximada",
    endereco: "Rua Deputado Lourenço de Andrade, 183, Centro",
    telefone: "(35) 3522-6865",
    tags: ["Grelhados"],
    fontes: ["Transportal (2022)"]
  },
  {
    id: "brasa-burguer",
    nome: "Brasa Burguer",
    categoria: "restaurante",
    coords: [-46.607642,-20.717395],
    localizacao: "aproximada",
    descricao: "Hamburgueria artesanal com carnes na brasa. Faz entregas pelo WhatsApp.",
    endereco: "Rua Gonçalves Dias, 801, Centro",
    telefone: "(35) 99248-1373",
    tags: ["Hambúrguer", "Delivery"],
    fontes: ["Bendito Guia", "ClickDisk"]
  },
  {
    id: "espetinho-gessello",
    nome: "Espetinho do Gessello",
    categoria: "restaurante",
    coords: [-46.597636,-20.728821],
    localizacao: "aproximada",
    endereco: "Avenida das Nações, 407, Jardim Vila Rica",
    telefone: "(35) 98845-0497",
    tags: ["Espetinho"],
    fontes: ["Bendito Guia"]
  },
  {
    id: "black-point",
    nome: "Black Point Espetaria",
    categoria: "restaurante",
    coords: [-46.61383,-20.706394],
    localizacao: "aproximada",
    endereco: "Rua Coronel João Lourenço, 143, Coimbras",
    telefone: "(35) 99771-7149",
    tags: ["Espetinho"],
    fontes: ["Bendito Guia"]
  },
  {
    id: "buffet-varanda",
    nome: "Buffet Varanda",
    categoria: "restaurante",
    coords: [-46.605613,-20.728582],
    localizacao: "aproximada",
    endereco: "Avenida Juca Stockler, 1255, Belo Horizonte",
    telefone: "(35) 3521-1727",
    tags: ["Buffet"],
    fontes: ["Bendito Guia"]
  },
  {
    id: "confeitaria-cristalina",
    nome: "Confeitaria Cristalina",
    categoria: "restaurante",
    coords: [-46.609792,-20.719804],
    localizacao: "aproximada",
    endereco: "Rua Presidente Antônio Carlos, 105, Centro",
    telefone: "(35) 3522-4365",
    tags: ["Confeitaria", "Doces"],
    fontes: ["Bendito Guia"]
  },
  {
    id: "villa-oba",
    nome: "Villa Oba Restaurante e Pizzaria",
    categoria: "restaurante",
    coords: [-46.611324,-20.714247],
    localizacao: "aproximada",
    endereco: "Avenida Comendador Francisco Avelino Maia, 2808",
    telefone: "(35) 98805-3472 / (35) 3521-7170",
    instagram: "villa_oba",
    horario: "Segunda a sexta, 17h às 23h30. Fins de semana e feriados, 11h à meia-noite",
    tags: ["Pizza", "Restaurante"],
    fontes: ["Instagram do estabelecimento", "ClickDisk"]
  },
  {
    id: "lanchonete-bolinha",
    nome: "Lanchonete do Bolinha",
    categoria: "restaurante",
    coords: [-46.608909,-20.72216],
    localizacao: "aproximada",
    descricao: "Lanchonete e hamburgueria. Atende também pelo WhatsApp.",
    endereco: "Rua Doutor Carvalho, 611, Centro",
    telefone: "(35) 3521-2433",
    instagram: "lanchonetedobolinha",
    tags: ["Lanches", "Hambúrguer"],
    fontes: ["Instagram do estabelecimento"]
  },
  {
    id: "dluigi",
    nome: "D'Luigi Pizzaria",
    categoria: "restaurante",
    coords: [-46.607977,-20.723083],
    localizacao: "aproximada",
    endereco: "Rua Doutor João Bráulio, 127, Centro",
    telefone: "(35) 3521-8700 / (35) 99227-5766",
    tags: ["Pizza"],
    fontes: ["ClickDisk"]
  },
  {
    id: "lapizza",
    nome: "Lapizza",
    categoria: "restaurante",
    coords: [-46.620803,-20.716591],
    localizacao: "aproximada",
    endereco: "Praça do Cruzeiro, 57, Penha",
    telefone: "(35) 3522-3771",
    horario: "19h às 23h. Fecha às terças",
    tags: ["Pizza"],
    fontes: ["ClickDisk"]
  },
  {
    id: "bar-cafe-globo",
    nome: "Bar e Café Globo",
    categoria: "restaurante",
    coords: [-46.611365,-20.71821],
    localizacao: "aproximada",
    endereco: "Rua Doutor Bernardino Vieira, 8, Centro",
    telefone: "(35) 3521-7595",
    tags: ["Bar"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "coliseu-bar",
    nome: "Coliseu Bar",
    categoria: "restaurante",
    coords: [-46.625661,-20.716895],
    localizacao: "aproximada",
    endereco: "Rua Joaquim Lopes, 102, Penha",
    telefone: "(35) 3522-7001",
    tags: ["Bar"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "nosso-bar",
    nome: "Nosso Bar",
    categoria: "restaurante",
    coords: [-46.605426,-20.723081],
    localizacao: "aproximada",
    endereco: "Rua 2 de Novembro, 287, Centro",
    telefone: "(35) 3521-2607",
    tags: ["Bar"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "bar-do-kubu",
    nome: "Bar do Kubu",
    categoria: "restaurante",
    coords: [-46.598623,-20.720986],
    localizacao: "aproximada",
    endereco: "Rua João Pimenta, 480, São Benedito",
    telefone: "(35) 3521-7503",
    tags: ["Bar"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "bar-sao-jose",
    nome: "Bar São José",
    categoria: "restaurante",
    coords: [-46.607252,-20.72426],
    localizacao: "aproximada",
    endereco: "Rua David Baldini, 327, Centro",
    telefone: "(35) 3521-1527",
    tags: ["Bar"],
    fontes: ["Guia Telefone"]
  },
  {
    id: "sabor-art",
    nome: "Restaurante Sabor & Art e Rotisseria",
    categoria: "restaurante",
    coords: [-46.61112,-20.71983],
    endereco: "Rua Coronel Neca Medeiros, 205, Centro",
    telefone: "(35) 3521-5897",
    tags: ["Restaurante", "Rotisseria"],
    fontes: ["OpenStreetMap", "Transportal (2022)"]
  },
  {
    id: "big-jhon",
    nome: "Big Jhon",
    categoria: "restaurante",
    coords: [-46.60841,-20.72216],
    tags: ["Lanches"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "d-gust",
    nome: "D'gust",
    categoria: "restaurante",
    coords: [-46.60709,-20.72194],
    tags: ["Lanches"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "grill-23",
    nome: "Grill 23",
    categoria: "restaurante",
    coords: [-46.60779,-20.72254],
    tags: ["Hambúrguer"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "hakuna-batata",
    nome: "Hakuna Batata",
    categoria: "restaurante",
    coords: [-46.60884,-20.72118],
    tags: ["Lanches"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "oba-oba-lanchonete",
    nome: "Oba Oba Lanchonete",
    categoria: "restaurante",
    coords: [-46.61015,-20.71914],
    tags: ["Lanches"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "pastelaria-passos",
    nome: "Pastelaria Passos",
    categoria: "restaurante",
    coords: [-46.60787,-20.72202],
    tags: ["Pastel"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "quero",
    nome: "Quero+",
    categoria: "restaurante",
    coords: [-46.6075,-20.7216],
    tags: ["Lanches"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "vitamina-central",
    nome: "Vitamina Central",
    categoria: "restaurante",
    coords: [-46.60806,-20.72246],
    tags: ["Sucos"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "agua-na-boca",
    nome: "Água na Boca",
    categoria: "restaurante",
    coords: [-46.61152,-20.72006],
    tags: ["Lanches"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "delicias-do-pao-de-queijo",
    nome: "Delícias do Pão de Queijo",
    categoria: "restaurante",
    coords: [-46.60381,-20.73436],
    tags: ["Pão de queijo"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "panificadora-mamata",
    nome: "Panificadora Mamata",
    categoria: "restaurante",
    coords: [-46.61057,-20.72333],
    tags: ["Padaria"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "chiquinho-sorvetes",
    nome: "Chiquinho Sorvetes",
    categoria: "restaurante",
    coords: [-46.60829,-20.72115],
    tags: ["Sorvete"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "mangutti",
    nome: "Mangutti",
    categoria: "restaurante",
    coords: [-46.61151,-20.71836],
    tags: ["Sorvete"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "paleteria-mexicomigo",
    nome: "Paleteria MexicoMigo",
    categoria: "restaurante",
    coords: [-46.60908,-20.72127],
    tags: ["Sorvete", "Paletas"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "palacio-do-sorvete",
    nome: "Palácio do Sorvete",
    categoria: "restaurante",
    coords: [-46.60891,-20.7212],
    tags: ["Sorvete"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "sorveteria-gelatto",
    nome: "Sorveteria Gelatto",
    categoria: "restaurante",
    coords: [-46.61153,-20.72054],
    tags: ["Sorvete"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "bar-do-limao",
    nome: "Bar do Limão",
    categoria: "restaurante",
    coords: [-46.61642,-20.72292],
    tags: ["Bar"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "bar-do-osmar",
    nome: "Bar do Osmar",
    categoria: "restaurante",
    coords: [-46.61746,-20.72311],
    tags: ["Bar"],
    fontes: ["OpenStreetMap"]
  },
  {
    id: "superdog",
    nome: "Superdog",
    categoria: "restaurante",
    coords: [-46.59978,-20.70756],
    endereco: "Rua Rio Piracicaba, 680",
    tags: ["Cachorro-quente"],
    fontes: ["OpenStreetMap"]
  }
];
