import {
  ContractType,
  CrmTrack,
  GeoCoords,
  GeoEligibility,
  NicheCategory,
  SeniorityLevel,
  WorkplaceType,
} from '../types';

export interface CityCoordEntry extends GeoCoords {
  label: string;
  state: string;
}

// Dicionário de coordenadas (lat, lng) das 27 capitais brasileiras e principais polos regionais
export const BRAZIL_CITY_COORDS: Record<string, CityCoordEntry> = {
  // Capitais Brasileiras (27 UFs)
  'sao paulo': { lat: -23.5505, lng: -46.6333, label: 'São Paulo', state: 'SP' },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729, label: 'Rio de Janeiro', state: 'RJ' },
  'belo horizonte': { lat: -19.9167, lng: -43.9345, label: 'Belo Horizonte', state: 'MG' },
  'curitiba': { lat: -25.4284, lng: -49.2733, label: 'Curitiba', state: 'PR' },
  'porto alegre': { lat: -30.0346, lng: -51.2177, label: 'Porto Alegre', state: 'RS' },
  'florianopolis': { lat: -27.5954, lng: -48.5480, label: 'Florianópolis', state: 'SC' },
  'brasilia': { lat: -15.7975, lng: -47.8919, label: 'Brasília', state: 'DF' },
  'goiania': { lat: -16.6869, lng: -49.2648, label: 'Goiânia', state: 'GO' },
  'salvador': { lat: -12.9714, lng: -38.5014, label: 'Salvador', state: 'BA' },
  'recife': { lat: -8.0476, lng: -34.8770, label: 'Recife', state: 'PE' },
  'fortaleza': { lat: -3.7319, lng: -38.5267, label: 'Fortaleza', state: 'CE' },
  'vitoria': { lat: -20.3155, lng: -40.3128, label: 'Vitória', state: 'ES' },
  'manaus': { lat: -3.1190, lng: -60.0217, label: 'Manaus', state: 'AM' },
  'belem': { lat: -1.4558, lng: -48.4902, label: 'Belém', state: 'PA' },
  'natal': { lat: -5.7945, lng: -35.2110, label: 'Natal', state: 'RN' },
  'joao pessoa': { lat: -7.1195, lng: -34.8450, label: 'João Pessoa', state: 'PB' },
  'maceio': { lat: -9.6658, lng: -35.7353, label: 'Maceió', state: 'AL' },
  'aracaju': { lat: -10.9472, lng: -37.0731, label: 'Aracaju', state: 'SE' },
  'teresina': { lat: -5.0892, lng: -42.8016, label: 'Teresina', state: 'PI' },
  'sao luis': { lat: -2.5307, lng: -44.3068, label: 'São Luís', state: 'MA' },
  'campo grande': { lat: -20.4697, lng: -54.6201, label: 'Campo Grande', state: 'MS' },
  'cuiaba': { lat: -15.6014, lng: -56.0979, label: 'Cuiabá', state: 'MT' },
  'palmas': { lat: -10.1840, lng: -48.3336, label: 'Palmas', state: 'TO' },
  'porto velho': { lat: -8.7612, lng: -63.9004, label: 'Porto Velho', state: 'RO' },
  'boa vista': { lat: 2.8235, lng: -60.6758, label: 'Boa Vista', state: 'RR' },
  'macapa': { lat: 0.0349, lng: -51.0694, label: 'Macapá', state: 'AP' },
  'rio branco': { lat: -9.9754, lng: -67.8249, label: 'Rio Branco', state: 'AC' },

  // São Paulo (Região Metropolitana, Interior e Litoral)
  'barueri': { lat: -23.5114, lng: -46.8761, label: 'Barueri', state: 'SP' },
  'alphaville': { lat: -23.4986, lng: -46.8475, label: 'Alphaville', state: 'SP' },
  'santana de parnaiba': { lat: -23.4439, lng: -46.9178, label: 'Santana de Parnaíba', state: 'SP' },
  'osasco': { lat: -23.5329, lng: -46.7916, label: 'Osasco', state: 'SP' },
  'guarulhos': { lat: -23.4543, lng: -46.5337, label: 'Guarulhos', state: 'SP' },
  'santo andre': { lat: -23.6639, lng: -46.5383, label: 'Santo André', state: 'SP' },
  'sao bernardo do campo': { lat: -23.6914, lng: -46.5646, label: 'São Bernardo do Campo', state: 'SP' },
  'sao caetano do sul': { lat: -23.6229, lng: -46.5548, label: 'São Caetano do Sul', state: 'SP' },
  'diadema': { lat: -23.6861, lng: -46.6206, label: 'Diadema', state: 'SP' },
  'maua': { lat: -23.6677, lng: -46.4613, label: 'Mauá', state: 'SP' },
  'taboao da serra': { lat: -23.6095, lng: -46.7583, label: 'Taboão da Serra', state: 'SP' },
  'embu das artes': { lat: -23.6489, lng: -46.8522, label: 'Embu das Artes', state: 'SP' },
  'cotia': { lat: -23.6022, lng: -46.9190, label: 'Cotia', state: 'SP' },
  'mogi das cruzes': { lat: -23.5225, lng: -46.1883, label: 'Mogi das Cruzes', state: 'SP' },
  'santos': { lat: -23.9608, lng: -46.3336, label: 'Santos', state: 'SP' },
  'campinas': { lat: -22.9056, lng: -47.0608, label: 'Campinas', state: 'SP' },
  'vinhedo': { lat: -23.0297, lng: -46.9753, label: 'Vinhedo', state: 'SP' },
  'valinhos': { lat: -22.9706, lng: -46.9958, label: 'Valinhos', state: 'SP' },
  'indaiatuba': { lat: -23.0903, lng: -47.2181, label: 'Indaiatuba', state: 'SP' },
  'paulinia': { lat: -22.7611, lng: -47.1542, label: 'Paulínia', state: 'SP' },
  'hortolandia': { lat: -22.8583, lng: -47.2200, label: 'Hortolândia', state: 'SP' },
  'sumare': { lat: -22.8219, lng: -47.2669, label: 'Sumaré', state: 'SP' },
  'americana': { lat: -22.7392, lng: -47.3314, label: 'Americana', state: 'SP' },
  'limeira': { lat: -22.5647, lng: -47.4017, label: 'Limeira', state: 'SP' },
  'piracicaba': { lat: -22.7253, lng: -47.6492, label: 'Piracicaba', state: 'SP' },
  'sorocaba': { lat: -23.5015, lng: -47.4526, label: 'Sorocaba', state: 'SP' },
  'jundiai': { lat: -23.1864, lng: -46.8842, label: 'Jundiaí', state: 'SP' },
  'itu': { lat: -23.2642, lng: -47.2992, label: 'Itu', state: 'SP' },
  'sao jose dos campos': { lat: -23.2237, lng: -45.9009, label: 'São José dos Campos', state: 'SP' },
  'taubate': { lat: -23.0264, lng: -45.5553, label: 'Taubaté', state: 'SP' },
  'jacarei': { lat: -23.3053, lng: -45.9658, label: 'Jacareí', state: 'SP' },
  'ribeirao preto': { lat: -21.1775, lng: -47.8103, label: 'Ribeirão Preto', state: 'SP' },
  'franca': { lat: -20.5386, lng: -47.4008, label: 'Franca', state: 'SP' },
  'sao carlos': { lat: -22.0175, lng: -47.8908, label: 'São Carlos', state: 'SP' },
  'araraquara': { lat: -21.7944, lng: -48.1756, label: 'Araraquara', state: 'SP' },
  'rio claro': { lat: -22.4114, lng: -47.5614, label: 'Rio Claro', state: 'SP' },
  'araras': { lat: -22.3569, lng: -47.3842, label: 'Araras', state: 'SP' },
  'leme': { lat: -22.1856, lng: -47.3903, label: 'Leme', state: 'SP' },
  'pirassununga': { lat: -21.9961, lng: -47.4258, label: 'Pirassununga', state: 'SP' },
  'bauru': { lat: -22.3145, lng: -49.0587, label: 'Bauru', state: 'SP' },
  'sao jose do rio preto': { lat: -20.8197, lng: -49.3794, label: 'São José do Rio Preto', state: 'SP' },
  'aracatuba': { lat: -21.2089, lng: -50.4328, label: 'Araçatuba', state: 'SP' },
  'marilia': { lat: -22.2139, lng: -49.9458, label: 'Marília', state: 'SP' },
  'presidente prudente': { lat: -22.1256, lng: -51.3889, label: 'Presidente Prudente', state: 'SP' },
  'barra bonita': { lat: -22.4947, lng: -48.5581, label: 'Barra Bonita', state: 'SP' },
  'charqueada': { lat: -22.5097, lng: -47.7783, label: 'Charqueada', state: 'SP' },
  'mogi guacu': { lat: -22.3719, lng: -46.9422, label: 'Mogi Guaçu', state: 'SP' },
  'mogi mirim': { lat: -22.4319, lng: -46.9578, label: 'Mogi Mirim', state: 'SP' },
  'itapira': { lat: -22.4361, lng: -46.8219, label: 'Itapira', state: 'SP' },
  'sao joao da boa vista': { lat: -21.9692, lng: -46.7981, label: 'São João da Boa Vista', state: 'SP' },
  'mococa': { lat: -21.4678, lng: -47.0044, label: 'Mococa', state: 'SP' },
  'sao jose do rio pardo': { lat: -21.5956, lng: -46.8886, label: 'São José do Rio Pardo', state: 'SP' },
  'casa branca': { lat: -21.7739, lng: -47.0864, label: 'Casa Branca', state: 'SP' },
  'espirito santo do pinhal': { lat: -22.1908, lng: -46.7406, label: 'Espírito Santo do Pinhal', state: 'SP' },
  'caconde': { lat: -21.5294, lng: -46.6439, label: 'Caconde', state: 'SP' },
  'atibaia': { lat: -23.1169, lng: -46.5503, label: 'Atibaia', state: 'SP' },
  'braganca paulista': { lat: -22.9519, lng: -46.5419, label: 'Bragança Paulista', state: 'SP' },

  // Minas Gerais
  'contagem': { lat: -19.9317, lng: -44.0536, label: 'Contagem', state: 'MG' },
  'betim': { lat: -19.9678, lng: -44.1983, label: 'Betim', state: 'MG' },
  'nova lima': { lat: -19.9856, lng: -43.8467, label: 'Nova Lima', state: 'MG' },
  'uberlandia': { lat: -18.9186, lng: -48.2772, label: 'Uberlândia', state: 'MG' },
  'uberaba': { lat: -19.7483, lng: -47.9319, label: 'Uberaba', state: 'MG' },
  'juiz de fora': { lat: -21.7642, lng: -43.3503, label: 'Juiz de Fora', state: 'MG' },
  'montes claros': { lat: -16.7350, lng: -43.8617, label: 'Montes Claros', state: 'MG' },
  'pocos de caldas': { lat: -21.7878, lng: -46.5614, label: 'Poços de Caldas', state: 'MG' },
  'pouso alegre': { lat: -22.2300, lng: -45.9361, label: 'Pouso Alegre', state: 'MG' },
  'varginha': { lat: -21.5514, lng: -45.4303, label: 'Varginha', state: 'MG' },
  'alfenas': { lat: -21.4292, lng: -45.9472, label: 'Alfenas', state: 'MG' },
  'lavras': { lat: -21.2453, lng: -44.9997, label: 'Lavras', state: 'MG' },
  'divinopolis': { lat: -20.1389, lng: -44.8839, label: 'Divinópolis', state: 'MG' },
  'sete lagoas': { lat: -19.4658, lng: -44.2467, label: 'Sete Lagoas', state: 'MG' },
  'ipatinga': { lat: -19.4683, lng: -42.5367, label: 'Ipatinga', state: 'MG' },
  'governador valadares': { lat: -18.8511, lng: -41.9494, label: 'Governador Valadares', state: 'MG' },
  'passos': { lat: -20.7189, lng: -46.6097, label: 'Passos', state: 'MG' },
  'itauna': { lat: -20.0753, lng: -44.5764, label: 'Itaúna', state: 'MG' },
  'itajuba': { lat: -22.4256, lng: -45.4528, label: 'Itajubá', state: 'MG' },
  'santa rita do sapucai': { lat: -22.2522, lng: -45.7033, label: 'Santa Rita do Sapucaí', state: 'MG' },
  'tres coracoes': { lat: -21.6947, lng: -45.2553, label: 'Três Corações', state: 'MG' },
  'tres pontas': { lat: -21.3672, lng: -45.5125, label: 'Três Pontas', state: 'MG' },
  'guaxupe': { lat: -21.3053, lng: -46.7128, label: 'Guaxupé', state: 'MG' },
  'sao sebastiao do paraiso': { lat: -20.9169, lng: -46.9914, label: 'São Sebastião do Paraíso', state: 'MG' },
  'monte belo': { lat: -21.3264, lng: -46.3647, label: 'Monte Belo', state: 'MG' },
  'juruaia': { lat: -21.2519, lng: -46.5719, label: 'Juruaia', state: 'MG' },
  'nova resende': { lat: -21.1247, lng: -46.4203, label: 'Nova Resende', state: 'MG' },
  'cabo verde': { lat: -21.4744, lng: -46.3958, label: 'Cabo Verde', state: 'MG' },
  'andradas': { lat: -22.0681, lng: -46.5692, label: 'Andradas', state: 'MG' },
  'machado': { lat: -21.6747, lng: -45.9197, label: 'Machado', state: 'MG' },
  'patos de minas': { lat: -18.5789, lng: -46.5181, label: 'Patos de Minas', state: 'MG' },
  'barbacena': { lat: -21.2258, lng: -43.7736, label: 'Barbacena', state: 'MG' },
  'ouro preto': { lat: -20.3856, lng: -43.5036, label: 'Ouro Preto', state: 'MG' },
  'extrema': { lat: -22.8547, lng: -46.3183, label: 'Extrema', state: 'MG' },

  // Rio de Janeiro
  'niteroi': { lat: -22.8833, lng: -43.1036, label: 'Niterói', state: 'RJ' },
  'duque de caxias': { lat: -22.7858, lng: -43.3117, label: 'Duque de Caxias', state: 'RJ' },
  'sao goncalo': { lat: -22.8269, lng: -43.0539, label: 'São Gonçalo', state: 'RJ' },
  'nova iguacu': { lat: -22.7592, lng: -43.4511, label: 'Nova Iguaçu', state: 'RJ' },
  'petropolis': { lat: -22.5050, lng: -43.1786, label: 'Petrópolis', state: 'RJ' },
  'volta redonda': { lat: -22.5231, lng: -44.1042, label: 'Volta Redonda', state: 'RJ' },
  'resende': { lat: -22.4689, lng: -44.4467, label: 'Resende', state: 'RJ' },
  'campos dos goytacazes': { lat: -21.7522, lng: -41.3303, label: 'Campos dos Goytacazes', state: 'RJ' },
  'macae': { lat: -22.3708, lng: -41.7869, label: 'Macaé', state: 'RJ' },
  'cabo frio': { lat: -22.8794, lng: -42.0186, label: 'Cabo Frio', state: 'RJ' },
  'angra dos reis': { lat: -23.0067, lng: -44.3181, label: 'Angra dos Reis', state: 'RJ' },
  'teresopolis': { lat: -22.4122, lng: -42.9656, label: 'Teresópolis', state: 'RJ' },

  // Paraná
  'londrina': { lat: -23.3103, lng: -51.1628, label: 'Londrina', state: 'PR' },
  'maringa': { lat: -23.4205, lng: -51.9333, label: 'Maringá', state: 'PR' },
  'ponta grossa': { lat: -25.0945, lng: -50.1633, label: 'Ponta Grossa', state: 'PR' },
  'cascavel': { lat: -24.9555, lng: -53.4552, label: 'Cascavel', state: 'PR' },
  'sao jose dos pinhais': { lat: -25.5347, lng: -49.2064, label: 'São José dos Pinhais', state: 'PR' },
  'foz do iguacu': { lat: -25.5163, lng: -54.5854, label: 'Foz do Iguaçu', state: 'PR' },
  'colombo': { lat: -25.2917, lng: -49.2242, label: 'Colombo', state: 'PR' },
  'quatro barras': { lat: -25.3656, lng: -49.0769, label: 'Quatro Barras', state: 'PR' },
  'pinhais': { lat: -25.4447, lng: -49.1925, label: 'Pinhais', state: 'PR' },
  'araucaria': { lat: -25.5931, lng: -49.4103, label: 'Araucária', state: 'PR' },
  'francisco beltrao': { lat: -26.0811, lng: -53.0550, label: 'Francisco Beltrão', state: 'PR' },
  'toledo': { lat: -24.7139, lng: -53.7431, label: 'Toledo', state: 'PR' },
  'guarapuava': { lat: -25.3908, lng: -51.4622, label: 'Guarapuava', state: 'PR' },
  'paranagua': { lat: -25.5161, lng: -48.5225, label: 'Paranaguá', state: 'PR' },

  // Santa Catarina
  'joinville': { lat: -26.3044, lng: -48.8487, label: 'Joinville', state: 'SC' },
  'blumenau': { lat: -26.9194, lng: -49.0661, label: 'Blumenau', state: 'SC' },
  'itajai': { lat: -26.9078, lng: -48.6619, label: 'Itajaí', state: 'SC' },
  'balneario camboriu': { lat: -26.9906, lng: -48.6347, label: 'Balneário Camboriú', state: 'SC' },
  'chapeco': { lat: -27.1006, lng: -52.6152, label: 'Chapecó', state: 'SC' },
  'criciuma': { lat: -28.6775, lng: -49.3697, label: 'Criciúma', state: 'SC' },
  'jaragua do sul': { lat: -26.4861, lng: -49.0667, label: 'Jaraguá do Sul', state: 'SC' },
  'sao jose': { lat: -27.6147, lng: -48.6278, label: 'São José', state: 'SC' },
  'palhoca': { lat: -27.6453, lng: -48.6678, label: 'Palhoça', state: 'SC' },
  'lages': { lat: -27.8161, lng: -50.3261, label: 'Lages', state: 'SC' },
  'brusque': { lat: -27.0978, lng: -48.9175, label: 'Brusque', state: 'SC' },
  'tijucas': { lat: -27.2414, lng: -48.6336, label: 'Tijucas', state: 'SC' },
  'tubarao': { lat: -28.4669, lng: -49.0069, label: 'Tubarão', state: 'SC' },

  // Rio Grande do Sul
  'caxias do sul': { lat: -29.1678, lng: -51.1794, label: 'Caxias do Sul', state: 'RS' },
  'canoas': { lat: -29.9178, lng: -51.1836, label: 'Canoas', state: 'RS' },
  'novo hamburgo': { lat: -29.6783, lng: -51.1306, label: 'Novo Hamburgo', state: 'RS' },
  'sao leopoldo': { lat: -29.7603, lng: -51.1472, label: 'São Leopoldo', state: 'RS' },
  'pelotas': { lat: -31.7654, lng: -52.3376, label: 'Pelotas', state: 'RS' },
  'santa maria': { lat: -29.6842, lng: -53.8069, label: 'Santa Maria', state: 'RS' },
  'gravatai': { lat: -29.9444, lng: -50.9919, label: 'Gravataí', state: 'RS' },
  'viamao': { lat: -30.0811, lng: -51.0233, label: 'Viamão', state: 'RS' },
  'campo bom': { lat: -29.6789, lng: -51.0606, label: 'Campo Bom', state: 'RS' },
  'passo fundo': { lat: -28.2628, lng: -52.4067, label: 'Passo Fundo', state: 'RS' },
  'estacao': { lat: -27.9114, lng: -52.2606, label: 'Estação', state: 'RS' },
  'santa cruz do sul': { lat: -29.7175, lng: -52.4258, label: 'Santa Cruz do Sul', state: 'RS' },
  'bento goncalves': { lat: -29.1714, lng: -51.5192, label: 'Bento Gonçalves', state: 'RS' },
  'rio grande': { lat: -32.0350, lng: -52.0986, label: 'Rio Grande', state: 'RS' },
  'erechim': { lat: -27.6342, lng: -52.2739, label: 'Erechim', state: 'RS' },

  // Goiás / DF / Centro-Oeste
  'anapolis': { lat: -16.3281, lng: -48.9531, label: 'Anápolis', state: 'GO' },
  'aparecida de goiania': { lat: -16.8197, lng: -49.2469, label: 'Aparecida de Goiânia', state: 'GO' },
  'luziania': { lat: -16.2525, lng: -47.9503, label: 'Luziânia', state: 'GO' },
  'rio verde': { lat: -17.7981, lng: -50.9192, label: 'Rio Verde', state: 'GO' },
  'catalao': { lat: -18.1658, lng: -47.9464, label: 'Catalão', state: 'GO' },
  'itumbiara': { lat: -18.4192, lng: -49.2153, label: 'Itumbiara', state: 'GO' },
  'dourados': { lat: -22.2231, lng: -54.8122, label: 'Dourados', state: 'MS' },
  'rondonopolis': { lat: -16.4708, lng: -54.6356, label: 'Rondonópolis', state: 'MT' },
  'sinop': { lat: -11.8642, lng: -55.5025, label: 'Sinop', state: 'MT' },
  'varzea grande': { lat: -15.6467, lng: -56.1325, label: 'Várzea Grande', state: 'MT' },

  // Espírito Santo
  'vila velha': { lat: -20.3297, lng: -40.2925, label: 'Vila Velha', state: 'ES' },
  'serra': { lat: -20.1286, lng: -40.3078, label: 'Serra', state: 'ES' },
  'cariacica': { lat: -20.2639, lng: -40.4164, label: 'Cariacica', state: 'ES' },
  'cachoeiro de itapemirim': { lat: -20.8489, lng: -41.1128, label: 'Cachoeiro de Itapemirim', state: 'ES' },
  'linhares': { lat: -19.3911, lng: -40.0722, label: 'Linhares', state: 'ES' },
  'colatina': { lat: -19.5389, lng: -40.6306, label: 'Colatina', state: 'ES' },

  // Nordeste e Norte
  'feira de santana': { lat: -12.2664, lng: -38.9667, label: 'Feira de Santana', state: 'BA' },
  'camacari': { lat: -12.6975, lng: -38.3242, label: 'Camaçari', state: 'BA' },
  'vitoria da conquista': { lat: -14.8619, lng: -40.8444, label: 'Vitória da Conquista', state: 'BA' },
  'lauro de freitas': { lat: -12.8944, lng: -38.3272, label: 'Lauro de Freitas', state: 'BA' },
  'ilheus': { lat: -14.7889, lng: -39.0494, label: 'Ilhéus', state: 'BA' },
  'itabuna': { lat: -14.7856, lng: -39.2803, label: 'Itabuna', state: 'BA' },
  'olinda': { lat: -8.0089, lng: -34.8553, label: 'Olinda', state: 'PE' },
  'jaboatao dos guararapes': { lat: -8.1128, lng: -35.0147, label: 'Jaboatão dos Guararapes', state: 'PE' },
  'caruaru': { lat: -8.2833, lng: -35.9761, label: 'Caruaru', state: 'PE' },
  'petrolina': { lat: -9.3891, lng: -40.5027, label: 'Petrolina', state: 'PE' },
  'caucaia': { lat: -3.7361, lng: -38.6531, label: 'Caucaia', state: 'CE' },
  'maracanau': { lat: -3.8769, lng: -38.6256, label: 'Maracanaú', state: 'CE' },
  'eusebio': { lat: -3.8900, lng: -38.4506, label: 'Eusébio', state: 'CE' },
  'sobral': { lat: -3.6883, lng: -40.3497, label: 'Sobral', state: 'CE' },
  'juazeiro do norte': { lat: -7.2131, lng: -39.3153, label: 'Juazeiro do Norte', state: 'CE' },
  'campina grande': { lat: -7.2306, lng: -35.8811, label: 'Campina Grande', state: 'PB' },
  'mossoro': { lat: -5.1878, lng: -37.3442, label: 'Mossoró', state: 'RN' },
  'parnamirim': { lat: -5.9156, lng: -35.2628, label: 'Parnamirim', state: 'RN' },
  'imperatriz': { lat: -5.5264, lng: -47.4917, label: 'Imperatriz', state: 'MA' },
  'parnaiba': { lat: -2.9056, lng: -41.7767, label: 'Parnaíba', state: 'PI' },
  'ananindeua': { lat: -1.3656, lng: -48.3722, label: 'Ananindeua', state: 'PA' },
  'santarem': { lat: -2.4431, lng: -54.7083, label: 'Santarém', state: 'PA' },
  'maraba': { lat: -5.3686, lng: -49.1178, label: 'Marabá', state: 'PA' },
  'araguaina': { lat: -7.1911, lng: -48.2072, label: 'Araguaína', state: 'TO' },
  'ji-parana': { lat: -10.8853, lng: -61.9517, label: 'Ji-Paraná', state: 'RO' },
};

// Chips de Habilidades alinhados ao posicionamento BizOps, Processos, Inteligência Comercial, CRM, Implantação, Dados e Automação/IA
export const POPULAR_FILTER_STACKS = [
  'Operações / BizOps',
  'Processos / BPMN',
  'Onboarding / CS',
  'Inteligência Comercial',
  'Inteligência de Mercado',
  'CRM',
  'HubSpot',
  'Salesforce',
  'RD Station / Pipedrive',
  'Chatwoot / Mensageria',
  'Sales Ops',
  'RevOps',
  'Análise de Dados',
  'Indicadores / KPIs',
  'SQL',
  'Power BI',
  'N8N',
  'Automação / IA',
  'APIs / Webhooks',
  'E-commerce / Ads',
  'Python',
  'Excel / Sheets',
];

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const BRAZIL_STATE_NAMES: Record<string, string> = {
  'acre': 'AC',
  'alagoas': 'AL',
  'amapa': 'AP',
  'amazonas': 'AM',
  'bahia': 'BA',
  'ceara': 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  'goias': 'GO',
  'maranhao': 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  'para': 'PA',
  'paraiba': 'PB',
  'parana': 'PR',
  'pernambuco': 'PE',
  'piaui': 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  'rondonia': 'RO',
  'roraima': 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  'sergipe': 'SE',
  'tocantins': 'TO',
};

const GENERIC_GEO_TOKENS = new Set([
  'brasil',
  'brazil',
  'remoto',
  'remote',
  'hibrido',
  'hybrid',
  'presencial',
  'onsite',
  'on-site',
  'flexivel',
  'flexible',
  'home office',
]);

const STATE_HOMONYM_CITIES = new Set(['sao paulo', 'rio de janeiro']);

const SORTED_CITY_KEYS = Object.keys(BRAZIL_CITY_COORDS).sort((a, b) => {
  const aIsState = STATE_HOMONYM_CITIES.has(a) ? 1 : 0;
  const bIsState = STATE_HOMONYM_CITIES.has(b) ? 1 : 0;
  if (aIsState !== bIsState) return aIsState - bIsState;
  return b.length - a.length;
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeGeoText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decodifica entidades HTML ANTES de remover tags para nunca vazar `<div class="content-intro">` na UI.
 */
export function cleanJobDescription(raw: string = ''): string {
  if (!raw) return '';
  return raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&#8217;/gi, "'")
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) && n > 31 ? String.fromCharCode(n) : ' ';
    })
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

function parseUfCode(rawState?: string): string {
  const norm = normalizeGeoText(rawState || '');
  if (!norm) return '';
  if (norm.length === 2 && BRAZIL_STATES.includes(norm.toUpperCase())) {
    return norm.toUpperCase();
  }
  return BRAZIL_STATE_NAMES[norm] || '';
}

export function haversineDistanceKm(a: GeoCoords, b: GeoCoords): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c);
}

export function resolveCityCoords(
  locationOrCity: string,
  stateHint?: string
): (GeoCoords & { city: string; state: string }) | null {
  const normFull = normalizeGeoText(locationOrCity);
  if (!normFull) return null;

  const hintUf = parseUfCode(stateHint);
  const rawSegments = normFull
    .split(/[,;()\-/|]+/)
    .map(s => s.trim())
    .filter(Boolean);

  let detectedUf = hintUf;
  const candidateSegments: string[] = [];

  for (const seg of rawSegments) {
    if (GENERIC_GEO_TOKENS.has(seg)) continue;
    const asUf = seg.length === 2 && BRAZIL_STATES.includes(seg.toUpperCase()) ? seg.toUpperCase() : '';
    if (asUf) {
      if (!detectedUf) detectedUf = asUf;
      continue;
    }
    candidateSegments.push(seg);
  }

  if (candidateSegments.length > 0) {
    const first = candidateSegments[0];
    const entry = BRAZIL_CITY_COORDS[first];
    if (entry && (!detectedUf || entry.state === detectedUf || !STATE_HOMONYM_CITIES.has(first))) {
      return { lat: entry.lat, lng: entry.lng, city: entry.label, state: entry.state };
    }
  }

  for (let i = 1; i < candidateSegments.length; i++) {
    const seg = candidateSegments[i];
    if (STATE_HOMONYM_CITIES.has(seg)) continue;
    const entry = BRAZIL_CITY_COORDS[seg];
    if (entry && (!detectedUf || entry.state === detectedUf)) {
      return { lat: entry.lat, lng: entry.lng, city: entry.label, state: entry.state };
    }
  }

  if (candidateSegments.length === 1) {
    const only = candidateSegments[0];
    const entry = BRAZIL_CITY_COORDS[only];
    if (entry) {
      return { lat: entry.lat, lng: entry.lng, city: entry.label, state: entry.state };
    }
  }

  const hasComma = normFull.includes(',');
  const primarySlice = hasComma ? normFull.split(',')[0].trim() : normFull;
  const fallbackTargets = primarySlice !== normFull ? [primarySlice, normFull] : [normFull];

  for (let idx = 0; idx < fallbackTargets.length; idx++) {
    const target = fallbackTargets[idx];
    for (const key of SORTED_CITY_KEYS) {
      if (idx > 0 && STATE_HOMONYM_CITIES.has(key)) continue;
      const pattern = new RegExp(`(?<![a-z0-9])${escapeRegex(key)}(?![a-z0-9])`);
      if (pattern.test(target)) {
        const entry = BRAZIL_CITY_COORDS[key];
        if (!detectedUf || entry.state === detectedUf || idx === 0) {
          return { lat: entry.lat, lng: entry.lng, city: entry.label, state: entry.state };
        }
      }
    }
  }

  return null;
}

export function calculateDistanceKm(
  userCoords: GeoCoords | null | undefined,
  jobLocation: string,
  jobCity?: string
): number | null {
  if (!userCoords) return null;

  if (jobCity && jobCity.trim()) {
    const resolvedByCity = resolveCityCoords(jobCity);
    if (resolvedByCity) {
      return haversineDistanceKm(userCoords, resolvedByCity);
    }
  }

  if (!jobLocation || !jobLocation.trim()) return null;

  const parts = jobLocation
    .split(';')
    .map(p => p.trim())
    .filter(Boolean);

  let minDistance: number | null = null;
  for (const part of parts) {
    const resolved = resolveCityCoords(part);
    if (resolved) {
      const dist = haversineDistanceKm(userCoords, resolved);
      if (minDistance === null || dist < minDistance) {
        minDistance = dist;
      }
    }
  }

  return minDistance;
}

export function findNearestKnownCity(coords: GeoCoords): { city: string; state: string; distanceKm: number } {
  let nearest: { city: string; state: string; distanceKm: number } = {
    city: 'São Paulo',
    state: 'SP',
    distanceKm: Number.POSITIVE_INFINITY,
  };

  for (const entry of Object.values(BRAZIL_CITY_COORDS)) {
    const dist = haversineDistanceKm(coords, entry);
    if (dist < nearest.distanceKm) {
      nearest = { city: entry.label, state: entry.state, distanceKm: dist };
    }
  }

  return nearest;
}

export async function reverseGeocodeCoords(coords: GeoCoords): Promise<{ city: string; state: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
      coords.lat
    )}&longitude=${encodeURIComponent(coords.lng)}&localityLanguage=pt`;
    const res = await fetch(url, { signal: controller.signal });
    if (res.ok) {
      const data = await res.json();
      const city = String(data.city || data.locality || '').trim();
      let state = '';
      if (typeof data.principalSubdivisionCode === 'string' && data.principalSubdivisionCode.includes('-')) {
        const ufPart = data.principalSubdivisionCode.split('-').pop()?.toUpperCase() || '';
        if (BRAZIL_STATES.includes(ufPart)) {
          state = ufPart;
        }
      }
      if (!state && typeof data.principalSubdivision === 'string') {
        state = parseUfCode(data.principalSubdivision);
      }
      if (city) {
        return { city, state };
      }
    }
  } catch {
    // Fallback offline abaixo
  } finally {
    clearTimeout(timeoutId);
  }

  const nearest = findNearestKnownCity(coords);
  return { city: nearest.city, state: nearest.state };
}

export async function geocodeCityName(
  city: string,
  state?: string
): Promise<(GeoCoords & { city: string; state: string }) | null> {
  const trimmedCity = (city || '').trim();
  if (!trimmedCity) return null;

  const localMatch = resolveCityCoords(trimmedCity, state);
  if (localMatch) {
    return localMatch;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const query = [trimmedCity, (state || '').trim(), 'Brasil'].filter(Boolean).join(', ');
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&addressdetails=1&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;

    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const hit = results[0];
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const addr = hit.address || {};
    const resolvedCity = String(addr.city || addr.town || addr.municipality || addr.village || trimmedCity).trim();
    const resolvedState =
      parseUfCode(addr['ISO3166-2-lvl4']?.split('-').pop()) ||
      parseUfCode(addr.state) ||
      parseUfCode(state);

    return {
      lat,
      lng,
      city: resolvedCity,
      state: resolvedState,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * BLACKLIST ESTRITA DE TÍTULOS:
 * Bloqueia TI/Infra/Dev/SRE/Segurança/QA/Engenharia de Dados, Vendas Frias (SDR/BDR/AE),
 * RH/DP/Folha, Jurídico, Contábil/Fiscal, Licitações, Call Center, Raters e Jovem Aprendiz.
 */
export function isBlacklistedTitle(title: string): boolean {
  if (!title) return true;
  const normalized = normalizeGeoText(title);

  const blacklistPatterns = [
    // TI / Suporte / Infra / Redes / Segurança / Dev / QA / Engenharia de Dados
    /\bsuporte\s+tecnico\b/i,
    /\btecnico\s+(de\s+)?suporte\b/i,
    /\banalista\s+de\s+suporte\b/i,
    /\bcustomer\s+support\s+engineer\b/i,
    /\btechnical\s+support\b/i,
    /\bhelp\s*desk\b/i,
    /\bservice\s*desk\b/i,
    /\bsuporte\s+n[123]\b/i,
    /\binfraestrutura\b/i,
    /\binfrastructure\b/i,
    /\bplatform\s+engineer\b/i,
    /\bsite\s+reliability\b/i,
    /\bsre\b/i,
    /\bnoc\b/i,
    /\boperacoes\s+de\s+redes\b/i,
    /\banalista\s+de\s+redes\b/i,
    /\bnetwork\s+(engineer|analyst|administrator|operations)\b/i,
    /\btelecom\b/i,
    /\bsysadmin\b/i,
    /\bsystems?\s+administrator\b/i,
    /\blinux\b/i,
    /\bsecurity\s+(engineer|analyst|operations|specialist)\b/i,
    /\bseguranca\s+da\s+informacao\b/i,
    /\bcybersecurity\b/i,
    /\binfosec\b/i,
    /\banalista\s+soc\b/i,
    /\bsecurity\s+operations\s+center\b/i,
    /\bdesenvolvedor(a)?\b/i,
    /\bdeveloper\b/i,
    /\bfront[\s-]*end\b/i,
    /\bback[\s-]*end\b/i,
    /\bfull[\s-]*stack\b/i,
    /\bdevops\b/i,
    /\bsoftware\s+engineer\b/i,
    /\bengenheiro(a)?\s+de\s+software\b/i,
    /\bmobile\s+engineer\b/i,
    /\bios\s+engineer\b/i,
    /\bandroid\s+engineer\b/i,
    /\bcloud\s+(engineer|architect)\b/i,
    /\bsolutions?\s+architect\b/i,
    /\bqa\b/i,
    /\bquality\s+assurance\b/i,
    /\banalista\s+de\s+testes\b/i,
    /\btest\s+(automation|engineer)\b/i,
    /\bautomation\s+(tester|qa)\b/i,
    /\bsdet\b/i,
    /\bdata\s+engineer\b/i,
    /\bengenheiro(a)?\s+de\s+dados\b/i,
    /\bengenharia\s+de\s+dados\b/i,
    /\banalytics\s+engineer\b/i,
    /\bmachine\s+learning\s+engineer\b/i,
    /\bml\s+engineer\b/i,
    /\bai\s+engineer\b/i,
    /\bdata\s+scientist\b/i,
    /\bcientista\s+de\s+dados\b/i,
    /\bdba\b/i,
    /\bdatabase\s+administrator\b/i,
    /\bscrum\s+master\b/i,
    /\bagile\s+coach\b/i,
    /\bproduct\s+designer\b/i,
    /\b(ux|ui)\s+designer\b/i,
    /\bgraphic\s+designer\b/i,
    /\bprogramador(a)?\b/i,

    // Vendas frias / Outbound / Prospecção pura
    /\baccount\s+executive\b/i,
    /\bexecutivo(a)?\s+de\s+(contas|vendas|negocios)\b/i,
    /\bexecutivo(a)?\s+comercial\b/i,
    /\bbdr\b/i,
    /\bsdr\b/i,
    /\bsales\s+development\b/i,
    /\bbusiness\s+development\s+rep(resentative)?\b/i,
    /\binside\s+sales\b/i,
    /\bvendedor(a)?\b/i,
    /\bconsultor(a)?\s+(comercial|de\s+vendas)\b/i,
    /\brepresentante\s+comercial\b/i,
    /\bcloser\b/i,
    /\bkey\s+account\s+manager\b/i,
    /\bassessor(a)?\s+de\s+investimentos\b/i,

    // RH / DP / Jurídico / Contábil / Fiscal / Backoffice operacional fora de escopo
    /\bjovem\s+aprendiz\b/i,
    /\bmenor\s+aprendiz\b/i,
    /\baprendiz\b/i,
    /\brecruiter\b/i,
    /\brecrutador(a)?\b/i,
    /\btalent\s+acquisition\b/i,
    /\bpeople\s+(ops|operations|partner|analytics)\b/i,
    /\boperacoes\s+de\s+rh\b/i,
    /\bimplantacao\s+em\s+rh\b/i,
    /\brecursos\s+humanos\b/i,
    /\bdepartamento\s+pessoal\b/i,
    /\badmissao\b/i,
    /\bfolha\s+de\s+pagamento\b/i,
    /\bpayroll\b/i,
    /\bgeneral\s+counsel\b/i,
    /\blegal\s+(counsel|operations|analyst)\b/i,
    /\bjuridico\b/i,
    /\badvogad[oa]\b/i,
    /\bparalegal\b/i,
    /\bcontabil\b/i,
    /\bcontador(a)?\b/i,
    /\baccountant\b/i,
    /\baccounting\b/i,
    /\bsec\s+reporting\b/i,
    /\bfiscal\b/i,
    /\btributari[oa]\b/i,
    /\btax\s+(analyst|specialist|manager|operations)\b/i,
    /\bauditor(ia)?\b/i,
    /\btesouraria\b/i,
    /\bcontas\s+a\s+(pagar|receber)\b/i,
    /\blicitac(ao|oes)\b/i,
    /\bpregao\b/i,
    /\bcompras\b/i,
    /\bsuprimentos\b/i,
    /\bprocurement\b/i,
    /\btecnico\s+de\s+cadastro\b/i,
    /\balmoxarifado\b/i,
    /\bmotorista\b/i,
    /\brecepcionista\b/i,
    /\boperador(a)?\s+de\s+(loja|caixa|telemarketing|atendimento)\b/i,
    /\bcall\s*center\b/i,
    /\btelemarketing\b/i,
    /\bouvidoria\b/i,
    /\bannotator\b/i,
    /\brater\b/i,
    /\bai\s+trainer\b/i,
    /\bdata\s+labeling\b/i,
    /\bcopywriter\b/i,
    /\bredator(a)?\b/i,
    /\bsocial\s+media\b/i,
    /\bvideo\s+editor\b/i,
    /\bmilitary\b/i,
    /\bpatient\s+onboarding\b/i,
    /\bpropagandista\b/i,
    /\boperacoes\s+(agricolas|florestais|industriais|hospitalares|de\s+loja|portuarias|de\s+usina|de\s+aterro|leves|pesadas|aeroportuarias|de\s+patio)\b/i,
    /\bprocessos\s+(quimicos|industriais|produtivos|fabris|metalurgicos)\b/i,
    /\bengenhari?a\s+(civil|ambiental|mecanic[oa]|eletric[oa]|quimic[oa]|de\s+seguranca|agronomica|florestal|de\s+minas)\b/i,
    /\bengenheiro(a)?\s+(civil|mecanic[oa]|eletricista|quimic[oa]|ambiental|de\s+seguranca|agronom[oa]|de\s+producao|de\s+alimentos|florestal)\b/i,
    /\bmanutencao\b/i,
    /\bmineracao\b/i,
    /\baux\.?\s+de\s+operacoes\b/i,
    /\b(farmaceutic[oa]|enfermeir[oa]|medic[oa]|psicolog[oa]|nutricionista|fisioterapeuta|biomedic[oa]|veterinari[oa])\b/i,
    /\btecnico(a)?\s+(em?\s+)?(enfermagem|seguranca\s+do\s+trabalho|manutencao|eletronica|eletrotecnica|mecanica|quimica|edificacoes|agropecuaria|agricola|laboratorio)\b/i,
    /\bauxiliar\s+de\s+(limpeza|servicos\s+gerais|producao|cozinha|estoque|expedicao|almoxarifado|carga)\b/i,
  ];

  return blacklistPatterns.some(regex => regex.test(normalized));
}

/**
 * Exige que o TÍTULO represente genuinamente uma das carreiras-alvo:
 * BizOps/Operações, Processos, Inteligência Comercial/Mercado, Sales Ops/RevOps,
 * CRM, Implantação/Onboarding/CS, Dados/BI/Analytics ou Automação/IA de Negócios.
 */
export function isRelevantCareerTitle(title: string): boolean {
  if (!title || isBlacklistedTitle(title)) return false;
  const norm = normalizeGeoText(title);

  return /\b(operacoes|operations|bizops|business\s+operations|strategy\s*&\s*operations|estrategia\s+e\s+operacoes|excelencia\s+operacional|operational\s+excellence|processos|process\s+(analyst|improvement|specialist|excellence)|business\s+process|melhoria\s+continua|bpm|bpmn|analista\s+de\s+negocios|business\s+analyst|analista\s+de\s+requisitos|analista\s+de\s+solucoes|product\s+operations|product\s+owner|inteligencia\s+(de\s+mercado|comercial)|market\s+intelligence|sales\s+intelligence|commercial\s+intelligence|competitive\s+intelligence|planejamento\s+comercial|efetividade\s+comercial|pricing|precificacao|sales\s+ops|sales\s+operations|operacoes\s+comerciais|revops|revenue\s+operations|marketing\s+ops|marketing\s+operations|martech|growth\s+operations|gtm\s+operations|go-to-market|crm|hubspot|salesforce|pipedrive|lifecycle|retencao|implantacao|implementation|onboarding|technical\s+onboarding|customer\s+success|sucesso\s+do\s+cliente|cs\s+ops|analista\s+de\s+integracoes|integration\s+specialist|zendesk|chatwoot|analista\s+de\s+dados|data\s+analyst|data\s+product\s+analyst|analista\s+de\s+analytics|analytics\s+analyst|web\s+analytics|digital\s+analytics|business\s+intelligence|analista\s+de\s+bi|bi\s+analyst|power\s+bi|indicadores|business\s+analytics|e-?commerce\s+(analyst|operations|specialist)|(analista|assistente|consultor(a)?|especialista)\s+(de\s+)?e-?commerce|operacoes\s+de\s+e-?commerce|automacao|automation\s+(analyst|specialist|consultant)|process\s+automation|workflow\s+automation|ai\s+operations|n8n|low-code|no-code)\b/i.test(
    norm
  );
}

/**
 * Detecta armadilhas no corpo da descrição (AIOps de infraestrutura, idioma exótico obrigatório, SDR frio disfarçado)
 */
export function isDisguisedTrap(title: string, description: string = ''): boolean {
  const normDesc = normalizeGeoText(description);
  const normAll = normalizeGeoText(`${title} ${description}`);

  // AIOps Clássico (Infraestrutura / Observabilidade)
  if (/\baiops\b/i.test(normAll) && /\b(datadog|dynatrace|splunk|new\s+relic|kubernetes|prometheus|nagios|zabbix)\b/i.test(normAll)) {
    return true;
  }

  // Idiomas fora de PT / EN / ES exigidos como obrigatórios/bilíngues
  if (
    /\b(french|frances|german|alemao|mandarin|mandarim|korean|coreano|japanese|japones|italian|italiano)\s+(bilingual|fluent|fluency|fluente|required|mandatory|obrigatorio)\b/i.test(
      normAll
    ) ||
    /\b(bilingual|bilingue)\s*[\(\-:]?\s*(french|frances|german|alemao|mandarin|korean|japanese)\b/i.test(normAll)
  ) {
    return true;
  }

  // SDR / Prospecção fria por telefone disfarçada de Inteligência Comercial
  if (
    /\b(cold\s+call|cold\s+calling|ligacoes\s+frias|prospeccao\s+ativa\s+por\s+telefone|meta\s+diaria\s+de\s+ligacoes)\b/i.test(
      normDesc
    ) &&
    !/\b(sales\s+ops|revops|analista\s+de\s+crm|sql|power\s+bi)\b/i.test(normAll)
  ) {
    return true;
  }

  return false;
}

/**
 * Valida se uma vaga é geograficamente elegível para quem reside no Brasil.
 */
export function checkBrazilEligibility(
  isInternational: boolean,
  title: string,
  location: string,
  description: string = ''
): { eligible: boolean; tier: GeoEligibility } {
  const normLoc = normalizeGeoText(location);
  const normTitle = normalizeGeoText(title);
  const normDesc = normalizeGeoText(description.slice(0, 1800));
  const combinedHeader = `${normTitle} ${normLoc}`;

  const mentionsBrazil = /\b(brazil|brasil)\b/i.test(`${combinedHeader} ${normDesc}`);
  const mentionsLatam = /\b(latam|latin\s+america|america\s+latina|south\s+america|americas)\b/i.test(
    `${combinedHeader} ${normDesc}`
  );

  if (!isInternational) {
    const foreignNationalLeak =
      /\b(miami|florida|new\s+york|manhattan|san\s+francisco|california|texas|bucharest|romania|london|united\s+kingdom|madrid|lisbon|portugal|berlin|germany|mexico\s+city|bogota|buenos\s+aires|santiago|us\s*\(|usa\b|united\s+states)\b/i.test(
        normLoc
      ) && !/\b(brazil|brasil)\b/i.test(normLoc);

    return { eligible: !foreignNationalLeak, tier: 'br_nacional' };
  }

  // Bloqueio imediato se título ou localização restringem a país/região estrangeira sem Brasil
  const foreignLocLock =
    /\b(usa|u\.s\.|u\.s\.a\.|united\s+states|us\s+only|north\s+america|canada|uk|united\s+kingdom|europe|eu\s+only|eea|emea|dach|germany|austria|switzerland|france|spain|portugal|italy|netherlands|ireland|poland|romania|serbia|ukraine|bulgaria|nordics|sweden|denmark|norway|finland|australia|new\s+zealand|apac|asia|india|philippines|singapore|japan|korea|israel|uae|dubai|abu\s+dhabi|hong\s+kong|south\s+africa|washington\s+d\.?c\.?|california|new\s+york|texas|london|berlin|toronto|sydney|melbourne)\b/i.test(
      combinedHeader
    );

  if (foreignLocLock && !mentionsBrazil && !/\b(latam|latin\s+america|south\s+america)\b/i.test(combinedHeader)) {
    return { eligible: false, tier: 'global_remoto' };
  }

  // Bloqueio de vagas LATAM restritas exclusivamente a outro país da América Latina (ex: "Based in Argentina")
  const singleLatamCountryLoc =
    /\b(argentina|mexico|colombia|chile|peru|uruguay|costa\s+rica)\b/i.test(normLoc) &&
    !/\b(brazil|brasil|latam|latin\s+america)\b/i.test(normLoc);
  const singleLatamCountryBody =
    /\b(based\s+in|reside\s+in|located\s+in|living\s+in|residents\s+of|only\s+in)\s+(argentina|mexico|colombia|chile|peru|uruguay|costa\s+rica|the\s+us|the\s+united\s+states|united\s+states|usa|canada|uk|the\s+uk|europe|germany|australia|india|spain|serbia)\b/i.test(
      normDesc
    ) ||
    /\bheadquarters:\s*(remote\s*[-–,;]\s*)?(argentina|mexico|usa|united\s+states|washington|uk|europe|germany|australia|canada|abu\s+dhabi|singapore|india)\b/i.test(
      normDesc
    ) ||
    /\b(u\.?s\.?\s+citizenship|us\s+work\s+authorization|authorized\s+to\s+work\s+in\s+the\s+(us|united\s+states|uk|eu|canada|australia)|must\s+be\s+located\s+in\s+(the\s+)?(us|usa|uk|canada|eu|europe))\b/i.test(
      normDesc
    );

  if ((singleLatamCountryLoc || singleLatamCountryBody) && !/\b(brazil|brasil)\b/i.test(normLoc)) {
    return { eligible: false, tier: 'global_remoto' };
  }

  if (mentionsBrazil || mentionsLatam) {
    return { eligible: true, tier: 'latam_br' };
  }

  if (/\b(worldwide|anywhere\s+in\s+the\s+world|work\s+from\s+anywhere|global\s+remote|remote\s*-\s*global)\b/i.test(combinedHeader)) {
    return { eligible: true, tier: 'global_remoto' };
  }

  return { eligible: false, tier: 'global_remoto' };
}

/**
 * Lista negra de senioridade executiva/alta no título
 */
export function isExecutiveOrSeniorTitle(title: string): boolean {
  return /\b(staff|principal|director|diretor|diretora|head|lead|líder|lider|senior|sênior|sr\.?|especialista|specialist|manager|gerente|coordenador|coordenadora|coordinator|supervisor|supervisora|vp|vice\s+president|chief|architect|arquiteto|iii)\b/i.test(
    title
  );
}

/**
 * Classifica a vaga nas 5 áreas de atuação de Negócios, Operações, Inteligência, CRM/Onboarding, Dados/BI e Automação
 */
export function classifyJobCategories(title: string, description: string = ''): NicheCategory[] {
  const combined = `${title} ${description}`.toLowerCase();
  const categories: NicheCategory[] = [];

  if (
    /\b(opera[çc][õo]es|operations|bizops|business\s+operations|processos|process|bpm|bpmn|melhoria\s+cont[íi]nua|analista\s+de\s+neg[óo]cios|business\s+analyst|requisitos|product\s+operations|produto|product\s+owner|planejamento)\b/i.test(
      combined
    )
  ) {
    categories.push('bizops_processos');
  }
  if (
    /\b(intelig[êe]ncia\s+de\s+mercado|market\s+intelligence|intelig[êe]ncia\s+comercial|sales\s+intelligence|competitive\s+intelligence|go-to-market|gtm|pesquisa\s+de\s+mercado|pricing|planejamento\s+comercial|estrategia\s+comercial)\b/i.test(
      combined
    )
  ) {
    categories.push('inteligencia_mercado');
  }
  if (
    /\b(crm|revops|revenue\s+operations|sales\s+ops|sales\s+operations|opera[çc][õo]es\s+comerciais|hubspot|salesforce|pipedrive|rd\s+station|implanta[çc][ãa]o|onboarding|implementation|customer\s+success|sucesso\s+do\s+cliente|cs\s+ops|ativac[ãa]o|chatwoot|zendesk)\b/i.test(
      combined
    )
  ) {
    categories.push('crm_revops_onboarding');
  }
  if (
    /\b(dados|data|bi\b|business\s+intelligence|power\s+bi|looker|metabase|tableau|analytics|sql|etl|indicadores|kpis?|dashboard|ga4|tag\s+manager)\b/i.test(
      combined
    )
  ) {
    categories.push('dados_bi');
  }
  if (
    /\b(n8n|zapier|make\.com|integromat|automa[çc][ãa]o|automation|rpa|agentes\s+de\s+ia|ai\s+agents|ai\s+operations|llm|openai|gemini|prompt|webhooks)\b/i.test(
      combined
    )
  ) {
    categories.push('automacao_ia');
  }

  if (categories.length === 0) {
    categories.push('bizops_processos');
  }
  return categories;
}

/**
 * Identifica se a vaga é afirmativa exclusiva (PCD, gênero, raça/etnia, 50+, etc.)
 */
export function detectAffirmative(
  title: string,
  description: string = ''
): { isAffirmative: boolean; reason?: string } {
  const combined = `${title} ${description}`.toLowerCase();

  const patterns = [
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(pcd|pcds|defici[êe]ncia)\b/i, reason: 'Afirmativa PcD' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(mulher|mulheres|feminina)\b/i, reason: 'Afirmativa Mulheres' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(negr[ao]s?|pret[ao]s?|pard[ao]s?)\b/i, reason: 'Afirmativa Pessoas Negras/Pretas' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(lgbt|lgbtqia\+|trans|transg[êe]nero)\b/i, reason: 'Afirmativa LGBTQIA+' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(50\+|60\+|s[êe]nioridade et[áa]ria)\b/i, reason: 'Afirmativa 50+' },
    { regex: /\bvaga\s+afirmativa\b|\bprograma\s+afirmativo\b|\bbanco\s+afirmativo\b/i, reason: 'Programa Afirmativo' },
  ];

  for (const p of patterns) {
    if (p.regex.test(combined)) {
      return { isAffirmative: true, reason: p.reason };
    }
  }

  return { isAffirmative: false };
}

/**
 * Detecta exigência obrigatória de Espanhol avançado/fluente (ignorando quando for apenas desejável/diferencial).
 */
export function detectSpanishRequirement(title: string, description: string = ''): boolean {
  const normTitle = normalizeGeoText(title);
  const normDesc = normalizeGeoText(description);

  if (/\b(bilingue\s+espanhol|spanish\s+bilingual|bilingual\s*\(?spanish|espanhol\s+obrigatorio)\b/i.test(`${normTitle} ${normDesc}`)) {
    return true;
  }

  const sentences = normDesc.split(/[.\n;•]+/);
  for (const s of sentences) {
    if (!/\b(espanhol|spanish|espanol)\b/i.test(s)) continue;
    if (/\b(desejavel|diferencial|nice\s+to\s+have|plus|bonus|sera\s+um\s+diferencial|opcional)\b/i.test(s)) {
      continue;
    }
    if (/\b(avancado|fluente|fluent|fluency|advanced|obrigatorio|mandatory|required|necessario|indispensavel|c1|c2|b2)\b/i.test(s)) {
      return true;
    }
  }

  return false;
}

/**
 * Detecta requisitos presenciais ou viagens ocultas no texto de vagas marcadas como Remoto ("Falso Remoto").
 */
export function detectHiddenOnsiteWarning(
  workplaceType: WorkplaceType,
  title: string,
  description: string = ''
): { hasWarning: boolean; reason?: string } {
  if (workplaceType !== 'remoto') return { hasWarning: false };
  const norm = normalizeGeoText(`${title} ${description}`);

  if (
    /\b(encontros\s+presenciais|ida[s]?\s+presencia(l|is)|ida[s]?\s+ao\s+escritorio|[1-5]\s*x\s*(por|na)\s*semana\s*(presencial|no\s+escritorio)|regime\s+hibrido|modelo\s+hibrido|atuar\s+presencialmente|residir\s+(obrigatoriamente\s+)?em\s+[a-z]+)\b/i.test(
      norm
    )
  ) {
    return { hasWarning: true, reason: 'Presencial/Híbrido citado no texto' };
  }

  if (/\b(disponibilidade\s+para\s+viagens|viagens\s+(pontuais|frequentes|esporadicas|nacionais)|eventos\s+presenciais)\b/i.test(norm)) {
    return { hasWarning: true, reason: 'Viagens / eventos pontuais' };
  }

  return { hasWarning: false };
}

export function detectContractType(
  title: string,
  description: string = '',
  rawJobType: string = ''
): ContractType | undefined {
  const jt = normalizeGeoText(rawJobType);
  if (jt.includes('autonomous') || jt.includes('legal_entity') || jt === 'pj' || jt === 'contractor') return 'pj';
  if (jt.includes('temporary')) return 'temporario';
  if (jt.includes('intern') || jt.includes('trainee')) return 'estagio';
  if (jt.includes('effective') || jt === 'clt') return 'clt';

  const normTitle = normalizeGeoText(title);
  const normDesc = normalizeGeoText(description.slice(0, 1200));
  if (/\b(temporari[oa]|cobertura\s+de\s+licenca|contrato\s+determinado)\b/i.test(normTitle)) return 'temporario';
  if (/\b(estagio|estagiari[oa]|internship)\b/i.test(normTitle)) return 'estagio';
  if (/\b(modelo\s+pj|contratacao\s+pj|contrato\s+pj|\bpj\b|pessoa\s+juridica|autonomo)\b/i.test(`${normTitle} ${normDesc}`)) {
    return 'pj';
  }
  if (/\b(\bclt\b|efetivo)\b/i.test(`${normTitle} ${normDesc}`)) {
    return 'clt';
  }
  return undefined;
}

export function detectCrmTrack(title: string, description: string = ''): CrmTrack | undefined {
  const norm = normalizeGeoText(`${title} ${description}`);
  if (!/\b(crm|hubspot|salesforce|pipedrive|rd\s+station|klaviyo|braze|chatwoot)\b/i.test(norm)) {
    return undefined;
  }
  if (
    /\b(reguas?\s+de\s+relacionamento|email\s+marketing|push|sms|rfm|lifecycle|braze|klaviyo|sfmc|marketing\s+cloud|campanhas\s+de\s+retencao)\b/i.test(
      norm
    ) &&
    !/\b(webhooks?|n8n|sales\s+ops|revops|integrac(ao|oes)\s+via\s+api)\b/i.test(norm)
  ) {
    return 'crm_marketing';
  }
  return 'crm_tecnico';
}

export function calculateDaysOpen(publishedAtIso: string): number {
  const publishedDate = new Date(publishedAtIso);
  if (isNaN(publishedDate.getTime())) return 1;
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - publishedDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function detectSeniority(title: string, description: string = ''): SeniorityLevel {
  const normTitle = normalizeGeoText(title);
  const normDesc = normalizeGeoText(description);

  if (/\b(estagio|estagiari[oa]|intern|internship|trainee)\b/i.test(normTitle)) return 'estagio';

  if (isExecutiveOrSeniorTitle(title)) {
    if (
      /\b(senior|sr\.?|iii|nivel\s+3|n3)\b/i.test(normTitle) &&
      !/\b(staff|principal|director|diretor|diretora|head|lead|lider|especialista|specialist|manager|gerente|coordenador|coordenadora|supervisor|supervisora|vp|chief)\b/i.test(
        normTitle
      )
    ) {
      return 'senior';
    }
    return 'especialista';
  }

  if (
    /\b(junior|jr\.?|assistente|auxiliar|entry[\s-]*level|associate|nivel\s+1|\bn1\b)\b/i.test(normTitle) ||
    /\b(analista|analyst|consultor)\s+i\b/i.test(normTitle)
  ) {
    return 'junior';
  }

  if (/\b(pleno|pl\.?|mid[\s-]*level|\bii\b|nivel\s+2|\bn2\b)\b/i.test(normTitle)) {
    return 'pleno';
  }

  // Se o título não explicita Júnior/Pleno, avalia sinais fortes na descrição completa
  if (
    /\b([5-9]|1\d)\+?\s*(anos|years)\s+(de\s+)?(experiencia|experience|vivencia)\b/i.test(normDesc) ||
    /\bexperiencia\s+senior\b/i.test(normDesc)
  ) {
    return 'senior';
  }

  if (/\b(junior|entry\s+level|ate\s+2\s+anos|1\s+a\s+2\s+anos)\b/i.test(normDesc)) {
    return 'junior';
  }

  return 'pleno';
}

export function detectWorkplaceType(title: string, location: string = '', workplaceRaw: string = ''): WorkplaceType {
  const locTrim = (location || '').trim().toLowerCase();
  const combined = `${title} ${location} ${workplaceRaw}`.toLowerCase();
  if (combined.includes('híbrido') || combined.includes('hibrido') || combined.includes('hybrid')) return 'hibrido';
  if (
    combined.includes('remoto') ||
    combined.includes('remote') ||
    combined.includes('home office') ||
    combined.includes('teletrabalho') ||
    locTrim === 'brasil' ||
    locTrim === 'brazil'
  ) {
    return 'remoto';
  }
  if (combined.includes('presencial') || combined.includes('on-site') || combined.includes('onsite')) return 'presencial';
  return 'remoto';
}
