// ============================================================
// RC_Dados_Clinicos — Apps Script Central
// Ricardina Correia · Psicologia Pediátrica · Cédula 8233
// Versão 72.0 — maio 2026
//
// ═══════════════════════════════════════════════════════════════════════════
// ALTERAÇÕES v121.0 — família EIF · Escalas de Interferência Funcional
//   (EIFP pediátrica · EIFA adultos · EIFJ comportamentos de jogo)
//
// Integração ADITIVA. Nenhuma linha das versões anteriores foi removida ou
// alterada; todas as entradas novas foram inseridas no topo das estruturas
// existentes, sem tocar nas restantes.
//
//   · HEADERS['EIFP'] (23 colunas), ['EIFA'] (24) e ['EIFJ'] (25) — UMA aba por
//     instrumento. As duas formas de cada escala (autorrelato e heterorrelato)
//     partilham a aba e distinguem-se pela coluna 'Forma'.
//   · ABA — aliases para os três instrumentos e para as suas formas.
//   · DEDUPE_KEYS['EIFP'], ['EIFA'] e ['EIFJ'] — chave de SEIS elementos:
//     Código + Data + tipo de respondente + nome (os 4 da Secção 33) MAIS Forma
//     e Momento. Os dois últimos são indispensáveis nesta família: sem
//     'Momento', uma reavaliação (M2) submetida no mesmo dia da avaliação de
//     base (M1) pelo mesmo respondente seria descartada em silêncio; sem
//     'Forma', o mesmo sucederia a um autorrelato e a um heterorrelato
//     preenchidos pela mesma pessoa — situação corrente quando o cuidador
//     preenche a forma P e o jovem a forma C na mesma consulta. A extensão é
//     ADITIVA (mais discriminante, nunca menos) e mantém a idempotência em
//     re-sincronizações. upsertRow é genérico sobre o número de elementos da
//     chave, pelo que nada mais precisou de mudar.
//   · DEDUPE_ALIASES — DUAS chaves NOVAS, 'Forma' e 'Momento', deliberadamente
//     separadas das existentes para que NENHUM instrumento já integrado altere
//     o seu comportamento de dedupe. Nenhum alias existente foi tocado.
//   · buildRow — três ramos novos, inseridos no topo da função.
//
// ⚠ Guarda != null OBRIGATÓRIA em toda a família: o ZERO é resultado legítimo e
//   clinicamente informativo — total 0 significa ausência declarada de
//   interferência, 0 domínios assinalados é o resultado esperado num caso sem
//   compromisso, e 0 dias de ausência é distinto de «não respondeu».
//   (x||'') faria um protocolo válido parecer um protocolo sem dados.
//
// ⚠ As três escalas NÃO são comparáveis entre si: divergem a janela temporal
//   (7 dias na EIFP e na EIFA; 30 dias na EIFJ), o referente e a população-alvo.
//
// ⚠ Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos.
//
// ALTERAÇÕES v120.0 — adição mínima do CAARS · Conners' Adult ADHD Rating Scales
//   (Conners, Erhardt & Sparrow, 1999; Multi-Health Systems Inc.), formas longas de
//   auto-relato (S:L) e de heterorrelato (O:L), 66 itens cada, escala 0–3.
//   · HEADERS['CAARS_SL'] (21 colunas) e HEADERS['CAARS_OL'] (22 colunas) — DUAS abas,
//     uma por forma. A chave de cotação é IDÊNTICA nas duas formas (as redações é que
//     diferem: 1.ª pessoa no auto-relato, 3.ª pessoa no heterorrelato), pelo que as
//     colunas de resultado RB_A..RB_H são as mesmas; a O:L acrescenta TempoContacto e
//     ContextoObservacao, a S:L acrescenta Contexto.
//   · ABA['CAARS_SL'] e ABA['CAARS_OL'] + aliases em minúsculas e com hífen.
//   · buildRow — dois ramos novos, com os helpers caarsVal_/caarsNum_.
//   · DEDUPE_KEYS['CAARS_SL'] e ['CAARS_OL'] — dedupe de 4 elementos (Secção 33):
//     Código + Data + PreenchidoPor + NomePreenche, resolvidos pelos DEDUPE_ALIASES
//     já existentes ('Informante' → 'PreenchidoPor' · 'NomeInformante' →
//     'NomePreenche'). Nenhum alias criado ou alterado. A chave é indispensável na
//     forma O:L: dois observadores distintos da mesma pessoa (por exemplo cônjuge e
//     progenitor) podem submeter no mesmo dia sob o MESMO código, e o valor clínico
//     do instrumento está precisamente no contraste entre fontes.
//   · SEM colunas de T-score ou percentil — deliberado. As tabelas normativas do CAARS
//     são propriedade do editor (MHS) e não estão disponíveis em formato digital: a
//     conversão RB → T faz-se nas folhas de perfil oficiais, pelo sexo e idade da
//     PESSOA AVALIADA (nunca do observador), e é introduzida manualmente no painel
//     clínico de cada questionário, onde fica guardada localmente.
//   ⚠ Guarda != null OBRIGATÓRIA em toda a linha: neste instrumento o ZERO é resultado
//     legítimo e informativo — RB_x = 0 significa nenhum sintoma referenciado na
//     escala, e Inconsistencia = 0 significa concordância perfeita nos 8 pares de
//     itens equivalentes. (x||'') converteria ambos os casos em célula vazia, isto é,
//     faria um protocolo perfeitamente válido parecer um protocolo sem dados.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos —
//     zero linhas removidas ou alteradas.
//
// ALTERAÇÕES v119.0 — adição mínima do EII-PT · Escala de Intolerância à Incerteza
//   (Freeston, Rhéaume, Letarte, Dugas & Ladouceur, 1994; tradução inglesa de Buhr &
//   Dugas, 2002; estrutura bifatorial de Sexton & Dugas, 2009 — versão de 27 itens ·
//   Carleton, Norton & Asmundson, 2007 — versão de 12 itens). Tradução técnica de
//   trabalho para português europeu, SEM validação psicométrica nacional.
//   · HEADERS['EII27'] e HEADERS['EII12'] — DUAS abas, uma por versão. As Formas A
//     (adultos) e J (adolescentes 12–17) partilham a aba da respectiva versão e são
//     distinguidas pela coluna 'Forma': são quatro ficheiros HTML mas apenas dois
//     conjuntos de escalas, e o contraste entre formas nunca é comparável (a Forma J
//     é adaptação de registo linguístico, sem estudo de equivalência de medida).
//   · ABA — aliases das duas abas, incluindo os quatro nomes de ficheiro publicados.
//   · buildRow — dois ramos novos, inseridos ANTES do fallback genérico.
//     ⚠ Guarda != null OBRIGATÓRIA em todas as colunas numéricas: o POMP 0 é resultado
//       legítimo (pontuação no mínimo da amplitude teórica, isto é, todos os itens
//       cotados em 1), tal como o Δ POMP 0 (subescalas exactamente equivalentes) e o
//       DP_Itens 0 (padrão de resposta invariante — precisamente o caso em que a
//       coluna MAIS importa, por sinalizar protocolo de validade duvidosa).
//       (x||'') converteria os três casos em célula vazia.
//   · DEDUPE_KEYS['EII27'] e ['EII12'] — dedupe de 4 elementos (Secção 33): Código +
//     Data + PreenchidoPor + NomePreenche. As colunas chamam-se 'Informante' e
//     'NomeInformante' e resolvem pelos DEDUPE_ALIASES já existentes. Nenhum alias
//     criado ou alterado. A chave é necessária porque o mesmo código pode receber no
//     mesmo dia a Forma A (progenitor) e a Forma J (jovem) da mesma versão.
//   · SEM colunas de z, percentil, T-score ou ponto de corte — por construção. O
//     instrumento não tem normas portuguesas nem cortes com fundamentação empírica
//     consensual: toda a saída é POMP (percentagem da amplitude teórica) e bandas
//     descritivas por quintis. Acrescentar colunas normativas seria inventá-las.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos —
//     a v119.0 é estritamente aditiva sobre a v118.0, sem uma única linha removida.
//
// ALTERAÇÕES v118.0 — adição mínima do STOP-BANG (Chung et al., 2008; versão
//   portuguesa de referência para os critérios: Reis et al., 2015, Rev Port Pneumol
//   21(2):61-68). Aba única STOPBANG. Ficha de COTAÇÃO de uso clínico, preenchida
//   pelo profissional; NÃO é um formulário auto-administrado.
//   ⚠ Instrumento PROPRIETÁRIO (Frances Chung · University Health Network, Toronto;
//     www.stopbang.ca). Construção em VIA A-RESTRITA: reproduzem-se apenas as
//     designações dos domínios do acrónimo e os critérios operacionais objetivos,
//     que são factos clínicos e não expressão protegida. Os ENUNCIADOS DOS ITENS
//     não são reproduzidos em lado nenhum — nem no HTML, nem nesta aba, nem no
//     painel. A ampla circulação pública do questionário NÃO equivale a licença de
//     redistribuição, e a publicação da validação portuguesa não transfere direitos.
//   ⚠ Instrumento de ADULTO (≥ 18 anos): os critérios «idade > 50» e «IMC > 35»
//     carecem de significado em idade pediátrica. O HTML bloqueia idades < 18.
//   ⚠ É um índice FORMATIVO de acumulação de fatores de risco, não uma escala
//     reflexiva: alfa de Cronbach e análise fatorial dos itens são metodologicamente
//     inaplicáveis. Não existem subescalas — STOP e BANG são blocos de contagem.
//   ⚠ RASTREIO, nunca diagnóstico: sensibilidade elevada e especificidade baixa;
//     uma classificação de risco elevado gera proporção substancial de falsos
//     positivos e obriga a estudo do sono para estabelecer qualquer diagnóstico.
//   Alterações:
//   · HEADERS['STOPBANG'] — 36 colunas: identificação (5) + dados clínicos objetivos
//     e IMC derivado (6) + respostas transcritas do bloco STOP (4) + cotação item a
//     item, com a coluna 7 desdobrada nos dois critérios de perímetro cervical (9) +
//     subtotais e totais pelos dois critérios (4) + classificação em três níveis e
//     concordância (4) + probabilidades previstas (2) + elegibilidade (1) + Respostas.
//     'NomeUtente' e não 'NomeCriança' — tal como na ESS_Epworth, o protocolo descreve
//     a pessoa avaliada, adulta, e não a criança de um processo pediátrico.
//   · Dupla cotação do item 7 (perímetro cervical), decisão D-03 do documento-fonte:
//     Cot_N_PT aplica o limiar > 40 cm, indiferenciado por sexo (versão portuguesa de
//     Reis et al., 2015, e versão original de 2008) e é a PONTUAÇÃO PRINCIPAL;
//     Cot_N_UHN aplica o limiar da versão atual do detentor (masculino ≥ 43 cm,
//     feminino ≥ 41 cm) e serve de verificação de concordância. A coluna
//     'Concordancia' assinala a divergência quando os totais diferem; não a resolve —
//     a escolha do critério a reportar é clínica.
//   · Classificação em dois níveis: 'BandaDocumentoFonte' aplica as bandas 0–2 baixo ·
//     3–4 intermédio · ≥ 5 elevado; 'ClassificacaoFinal' aplica-lhes o refinamento da
//     faixa intermédia de Chung, Abdullah & Liao (Chest, 2016): pontuação 3–4 com
//     STOP ≥ 2 e (IMC > 35 ou perímetro cervical positivo ou sexo masculino) passa a
//     «Risco elevado (reclassificado)». 'ClassificacaoUHN' repete as bandas sobre o
//     total do critério paralelo.
//   · Probabilidades previstas de Reis et al. (2015), amostra portuguesa de clínica do
//     sono: SAOS de qualquer grau publicada apenas para 3–6 (64%, 80%, 90%, 95%) e
//     SAOS grave apenas para 6–8 (46%, 61%, 73%). As restantes pontuações recebem
//     «n.d.» — NÃO foi efetuada qualquer interpolação. São probabilidades de uma
//     população de prevalência de base elevada: a transposição para rastreio
//     comunitário ou cuidados de saúde primários sobrestima o risco.
//   · ABA — 6 aliases (nome da aba, variações de grafia e syncKey) → 'STOPBANG'.
//   · DEDUPE_KEYS['STOPBANG'] — dedupe de 4 elementos (Secção 33): Código + Data +
//     PreenchidoPor + NomePreenche, resolvidos pelos DEDUPE_ALIASES já existentes.
//     Nenhum alias foi criado ou alterado. A chave é necessária porque o mesmo utente
//     pode ser reavaliado no mesmo dia por profissionais diferentes, e porque o
//     protocolo pode ser repetido após correção de uma medição antropométrica.
//   · buildRow('STOPBANG') — guardas `!= null` em TODOS os campos numéricos: neste
//     instrumento o zero é um resultado válido e informativo em cada uma das nove
//     colunas de cotação (item negativo), nos dois subtotais (bloco sem indicadores) e
//     nos totais (Total = 0 → «Risco baixo», a menor acumulação possível de fatores de
//     risco). `||` converteria todos esses zeros genuínos em célula vazia, isto é,
//     faria um protocolo válido e negativo parecer um protocolo por preencher.
//   · Colunas decimais — Altura e IMC são gravadas com vírgula decimal em locale pt-PT:
//     formatar essas duas colunas do Sheet como TEXTO SIMPLES, sob pena de coerção
//     silenciosa para data.
//   Nenhuma linha foi removida ou alterada: a v118.0 é estritamente aditiva sobre a v117.0.

// ALTERAÇÕES v117.0 — adição mínima da ESS (Epworth Sleepiness Scale; Johns, 1991;
//   versão portuguesa CEISUC/LEPS, 2001). Aba única ESS_Epworth. Autorrelato de
//   adulto, 8 itens, escala 0–3, todos directos: sem inversões e sem ponderações.
//   Total = soma simples dos 8 itens, amplitude 0–24.
//   · HEADERS['ESS_Epworth'] — 34 colunas: identificação (9) + completude e
//     pontuação (5) + três sistemas interpretativos e concordância (4) +
//     agrupamento descritivo G1/G2 (5) + indicadores de padrão (5) + quatro
//     sinalizações + comparabilidade + Respostas.
//   · ⚠ A coluna 'NomeUtente' substitui aqui 'NomeCriança' por rigor semântico: a
//     ESS é validada para ADULTOS e o respondente responde sobre SI PRÓPRIO. Quando
//     é um progenitor a preencher, o resultado descreve o progenitor — o código do
//     paciente identifica o PROCESSO, não o sujeito da medida.
//   · ⚠ Guardas != null OBRIGATÓRIAS. Neste instrumento o ZERO é resultado legítimo
//     em quase todas as colunas numéricas: Total = 0 é «Sonolência normal» (a menor
//     propensão possível para adormecer), G1_Soma = G2_Soma = 0, N_Item_3 = 0,
//     Veiculo_4_8 = 0 e Dif_G2_G1 = 0 (perfil plano) são todos protocolos válidos e
//     informativos. (x||'') faria um protocolo completo parecer um sem dados.
//   · ⚠ Colunas que podem ficar VAZIAS por ausência legítima de valor, e não por
//     zero: Total, Max_Item, G1_Media, G2_Media e Dif_G2_G1 quando o protocolo é
//     inválido (menos de 6 itens — regra R5). Vazio = não interpretável; zero = valor
//     medido. Nunca converter um no outro.
//   · Regras de completude replicadas do ficheiro de cotação: R3 protocolo válido
//     (8/8) · R4 com 6 ou 7 itens gera estimativa pró-rateada [(soma / n) × 8,
//     arredondada], assinalada em 'Natureza' e não comparável a normas · R5 abaixo de
//     6 itens não produz pontuação · R6 item 8 (ao volante) não aplicável a não
//     condutores: fica em branco, aplica-se R4 e 'Comparabilidade' passa a «Limitada».
//   · Três sistemas interpretativos coexistem e NENHUM foi suprimido (anomalia A-01):
//     Sistema A, referência primária, 0–7 / 8–10 / 11–15 / 16–24 · critério dicotómico
//     da versão portuguesa, total >= 10 · bandas de Johns, 0–5 / 6–10 / 11–12 / 13–15 /
//     16–24. Divergem exclusivamente na pontuação 10, onde o Sistema A mantém
//     «Sonolência média» e o critério português é positivo. A coluna 'Concordancia'
//     assinala essa divergência; não a resolve.
//   · ⚠ As colunas G1_Soma, G1_Media, G2_Soma, G2_Media e Dif_G2_G1 são ESTRITAMENTE
//     descritivas (regra R7): a ESS é unidimensional e os agrupamentos não têm normas,
//     pontos de corte nem validação independente. Não reportar como subescalas.
//   · ⚠ Sem normas portuguesas por idade e sexo (anomalia A-04): não há colunas de
//     T-score nem de percentil, e nenhuma deve ser acrescentada sem transcrição
//     validada. A classificação assenta apenas em pontos de corte publicados.
//   · Coluna Respostas — guarda {item1..item8} com o valor bruto 0–3 de cada item
//     (null no item 8 quando excluído). É a fonte de verdade: o painel recalcula
//     sempre a pontuação a partir daqui e nunca lê as colunas de score quando o
//     JSON existe.
//   · G1_Media, G2_Media e Dif_G2_G1 são enviadas como NÚMERO (não como string
//     "2,29"), pelo que não se coloca o problema de coerção de locale pt-PT.
//   · ABA — 6 aliases (nome da aba, variações e syncKey) → 'ESS_Epworth'.
//   · DEDUPE_KEYS['ESS_Epworth'] — dedupe de 4 elementos (Secção 33): Código + Data +
//     PreenchidoPor + NomePreenche, que resolvem para 'Informante' e 'NomeInformante'
//     pelos DEDUPE_ALIASES já existentes. Nenhum alias criado ou alterado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos —
//     esta versão é estritamente aditiva.
//
// ALTERAÇÕES v116.0 — adição mínima do BRIEF-A (Behavior Rating Inventory of
//   Executive Function — Adult Version; Roth, Isquith & Gioia, 2005). Duas abas
//   paralelas: BRIEF_A_AUTO (autorrelato) e BRIEF_A_INF (relato do informante).
//   Heterorrelato e autorrelato partilham os 75 itens, a estrutura de escalas e o
//   cabeçalho de 25 colunas.
//   · ⚠ SÓ PONTUAÇÕES BRUTAS, por decisão clínica. As abas NÃO têm colunas de
//     T-score nem de percentil: a conversão normativa (que depende da idade e do
//     sexo) fica sujeita a validação manual nas tabelas do manual. As colunas
//     'Idade' e 'Género' existem precisamente para tornar essa leitura possível.
//   · HEADERS['BRIEF_A_AUTO'] e HEADERS['BRIEF_A_INF'] — 25 colunas idênticas:
//     identificação (9) + nove escalas clínicas + BRI + MI + GEC + as duas escalas
//     de validade + número de itens respondidos + Respostas.
//   · Escalas e itens (1-based): Inibição 5,16,29,36,43,55,58,73 · Flexibilidade
//     8,22,32,44,61,67 · Controlo Emocional 1,12,19,28,33,42,51,57,69,72 ·
//     Automonitorização 13,23,37,50,64,70 · Iniciativa 6,14,20,25,45,49,53,62 ·
//     Memória de Trabalho 4,11,17,26,35,46,56,68 · Planificação/Organização
//     9,15,21,34,39,47,54,63,66,71 · Monitorização da Tarefa 2,18,24,41,52,75 ·
//     Organização de Materiais 3,7,30,31,40,60,65,74.
//     BRI = 4 primeiras (30 itens, 30–90) · MI = 5 seguintes (40 itens, 40–120) ·
//     GEC = BRI + MI (70 itens, 70–210).
//   · ⚠ Os itens 10, 27, 38, 48 e 59 pertencem à escala de INFREQUÊNCIA e NÃO
//     entram em nenhuma escala clínica: 70 clínicos + 5 de validade = 75.
//   · ⚠ Guardas != null OBRIGATÓRIAS nos indicadores de validade. Neste instrumento
//     o ZERO é um resultado legítimo e informativo —
//       INFREQ = 0 → nenhum item improvável respondido na direcção atípica;
//       INCONS = 0 → concordância perfeita nos 10 pares de itens equivalentes.
//     (x||'') faria um protocolo perfeitamente válido parecer um sem dados.
//   · Coluna Respostas — guarda {1..75} com o valor bruto 1–3 de cada item
//     (Nunca = 1 · Às vezes = 2 · Frequentemente = 3). É a fonte de verdade da
//     cotação: o painel do questionário recalcula sempre escalas, índices e
//     validade a partir daqui e nunca lê as colunas de score quando o JSON existe.
//   · Colunas todas INTEIRAS — não há decimais, pelo que não se coloca o problema
//     de coerção de locale pt-PT que afecta os instrumentos com z e percentis.
//   · ABA — 6 aliases (nome da aba, nome longo e syncKey, para cada versão).
//   · DEDUPE_KEYS['BRIEF_A_AUTO'] e ['BRIEF_A_INF'] — dedupe de 4 elementos
//     (Secção 33): Código + Data + Relacao + NomePreenche. A coluna de tipo de
//     respondente chama-se 'Relação', pelo que se usa a chave 'Relacao' já
//     existente nos DEDUPE_ALIASES desde a v91.0; 'NomePreenche' resolve para
//     'NomeInformante'. NENHUM alias foi criado ou alterado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos —
//     alteração estritamente aditiva, zero linhas removidas (diff confirmado).
//
// ALTERAÇÕES v115.0 — adição mínima do PSWQ (Penn State Worry Questionnaire;
//   Meyer, Miller, Metzger & Borkovec, 1990). Autorrelato, 16 itens em escala 1–5,
//   total 16–80. Instrumento de circulação livre (Via A, sem editor comercial).
//   Normas portuguesas de Oliveira, Faustino, Freitas, Gonçalves, Ribeiro, Gonçalves
//   & Machado (2021), British Journal of Guidance & Counselling, 51(2), 251–261.
//   · HEADERS['PSWQ'] — 34 colunas. Total, média por item, os dois blocos de itens
//     (Escala Positiva PSWQ-11 e bloco invertido em métrica bruta e cotada), os cinco
//     pares z/percentil face às distribuições de referência, a banda descritiva, os
//     dois pares z/percentil de subescala, o indicador de coerência entre blocos, o
//     critério c, o número de omissões e o estado do protocolo.
//   · ⚠ Itens INVERTIDOS: 1, 3, 8, 10, 11 (valor cotado = 6 − resposta). Os restantes
//     11 são directos. Consequência: o mínimo empírico do total é 36 (todas as
//     respostas a 1) e o máximo empírico é 60 (todas a 5) — a amplitude teórica de
//     16 a 80 só é atingível com padrões mistos. Um total de 36 NÃO é um protocolo
//     vazio; é um resultado legítimo de ausência de preocupação.
//   · ⚠ Guardas != null OBRIGATÓRIAS em toda a linha. Neste instrumento o ZERO e os
//     NEGATIVOS são resultados legítimos e frequentes —
//       PSWQ_Z_Com = 0 → resultado exactamente na média comunitária portuguesa;
//       PSWQ_Z_Com, PSWQ_Z_Cli, PSWQ_Z_F1, PSWQ_Z_F2b < 0 → abaixo da média (a maioria
//         dos z face à norma clínica é negativa em protocolos comunitários);
//       PSWQ_Coerencia = 0 → os dois blocos anulam-se exactamente, que é justamente
//         o padrão de máxima coerência que o indicador procura;
//       PSWQ_Omissoes = 0 → protocolo completo, informação distinta de «sem dados».
//     (x||'') converteria todos estes casos em célula vazia e apagaria o resultado.
//   · ⚠ Colunas DECIMAIS (PSWQ_Media, todos os PSWQ_Z_*, todos os PSWQ_Pct_*,
//     PSWQ_Coerencia): formatar a coluna no Sheet como TEXTO SIMPLES antes de inserir
//     dados. A locale pt-PT converte «2,29» em data. O painel do questionário
//     recalcula sempre a partir da coluna Respostas e nunca lê estas colunas quando o
//     JSON está presente, pelo que uma eventual coerção não corrompe a interpretação
//     — mas corrompe a exportação e a leitura directa no Sheet.
//   · Coluna Respostas — guarda {I1..I16} com o valor bruto 1–5 de cada item (o valor
//     ANTES da inversão). É a fonte de verdade da cotação: o painel reconstrói o total,
//     os blocos, os z e os percentis a partir daqui.
//   · DEDUPE_KEYS['PSWQ'] — dedupe de 4 elementos (Secção 33): Código + Data +
//     PreenchidoPor + NomePreenche, que resolvem para 'Informante' e 'NomeInformante'
//     pelos DEDUPE_ALIASES já existentes. Nenhum alias criado ou alterado. A chave é
//     indispensável: o PSWQ é de AUTORRELATO e mede a preocupação de QUEM PREENCHE,
//     pelo que o jovem e cada progenitor podem submeter no mesmo dia sob o MESMO
//     código de paciente. Cada linha descreve uma pessoa diferente e nenhuma pode ser
//     descartada.
//   · ⚠ O instrumento está validado para ADULTOS (≥ 18 anos). A coluna Idade regista a
//     idade de QUEM RESPONDE, e não a da criança do processo — é essa idade que
//     determina a aplicabilidade das normas. Em população pediátrica o instrumento
//     indicado é o PSWQ-C (Chorpita, Tracey, Brown, Collica & Barlow, 1997).
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos —
//     diff auditado: 0 remoções de conteúdo.
//
// ALTERAÇÕES v114.0 — adição mínima das Escalas de Beck: BAI (Inventário de
//   Ansiedade de Beck; Beck & Steer, 1990/1993; validação portuguesa de Quintão,
//   Delgado & Prieto, 2013) e BDI-II (Inventário de Depressão de Beck II; Beck,
//   Steer & Brown, 1996; versão portuguesa de Quelhas Martins & Coelho, FMUP, 2000).
//   Ambos de AUTORRELATO, 21 itens em escala 0–3, total 0–63. Abas SEPARADAS: são
//   instrumentos distintos, com limiares distintos e podem ser aplicados isoladamente.
//   · HEADERS['BAI'] — 14 colunas. Total, classificação e os 4 agrupamentos de
//     sintomas (Subjetiva, Neurofisiológica, Autonómica, Pânico).
//   · HEADERS['BDI2'] — 13 colunas. Total, classificação, as 2 dimensões bifatoriais
//     (Cognitivo-Afetiva 1–13, Somática 14–21) e o valor isolado do ITEM 9.
//   · ⚠ Item 9 do BDI-II (pensamentos ou desejos suicidas) gravado em coluna PRÓPRIA
//     (BDI_Item9). É um sinalizador clínico binário (≥ 1 → avaliar ideação e risco
//     suicida directamente), independente do total: um total na banda mínima com o
//     item 9 cotado a 1 continua a exigir avaliação. Sem coluna própria, o
//     sinalizador ficaria enterrado no JSON de Respostas e não seria filtrável.
//   · ⚠ Guardas != null OBRIGATÓRIAS em toda a linha de ambos os instrumentos: o ZERO
//     é resultado legítimo e frequente —
//       BAI_Total = 0 / BDI_Total = 0 → nenhum sintoma endossado (banda «Mínima»);
//       BAI_SUBJ / BDI_COG / qualquer subescala = 0 → agrupamento sem endosso;
//       BDI_Item9 = 0 → ausência de ideação, que é precisamente a informação clínica
//         que se quer registar (distinta de «sem dados»).
//     (x||'') converteria todos estes casos em célula vazia e apagaria o resultado.
//   · ⚠ SEM colunas de percentagem ou de média decimal: a locale pt-PT do Sheet
//     converte «0,33» em data. Só se gravam INTEIROS. Os painéis dos questionários
//     recalculam sempre a partir da coluna Respostas.
//   · Coluna Respostas — no BAI guarda {I1..I21} com o valor 0–3 de cada item; no
//     BDI-II guarda {I1..I21} com {opcao, score}, porque os grupos 16 (sono) e 18
//     (apetite) têm 7 opções cotadas 0-1-1-2-2-3-3 e a opção escolhida não é
//     recuperável a partir da pontuação («Durmo muito mais» e «Durmo muito menos»
//     valem ambas 2 e são clinicamente opostas). A opção é a fonte de verdade.
//   · DEDUPE_KEYS['BAI'] e DEDUPE_KEYS['BDI2'] — dedupe de 4 elementos (Secção 33):
//     Código + Data + PreenchidoPor + NomePreenche, que resolvem para 'Informante' e
//     'NomeInformante' pelos DEDUPE_ALIASES já existentes. Nenhum alias criado ou
//     alterado. A chave é necessária: ambas as escalas podem ser aplicadas ao jovem e
//     a cada progenitor no mesmo dia, com o MESMO código de paciente — o instrumento
//     mede a ansiedade ou a depressão de QUEM PREENCHE, pelo que as várias linhas são
//     todas legítimas e nenhuma pode ser descartada.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos —
//     diff auditado: 0 remoções de conteúdo.
//
// ALTERAÇÕES v113.0 — adição mínima da SIAS · SPS (Escalas de Ansiedade Social;
//   Mattick & Clarke, 1998; versão portuguesa de Pinto-Gouveia & Salvador, 2001).
//   Autorrelato, 39 itens em escala 0–4: SIAS 19 itens (0–76) e SPS 20 itens (0–80),
//   ambas na MESMA aba, porque são aplicadas sempre em conjunto e o resultado
//   principal é o CONTRASTE entre as duas.
//   · HEADERS['SIAS_SPS'] — 20 colunas. Médias por item (0–4) das duas escalas, o
//     contraste (SPS − SIAS, −4 a +4), os totais e o estado do protocolo por escala,
//     e as duas posições descritivas face aos marcadores internacionais.
//   · ⚠ SEM normas portuguesas e SEM pontos de corte nacionais. Os marcadores
//     internacionais (SIAS 34 e 43; SPS 24 e 27) derivam de amostras ADULTAS e não
//     são interpretáveis abaixo dos 18 anos. As colunas Pos_SIAS e Pos_SPS guardam
//     texto DESCRITIVO, nunca uma classificação de gravidade.
//   · ⚠ Guardas != null OBRIGATÓRIAS: neste instrumento o ZERO é resultado legítimo —
//       SIAS_Media = 0 ou SPS_Media = 0 → nenhum item endossado (achado, não ausência);
//       Contraste = 0 → as duas médias coincidem, que é precisamente um dos padrões
//       de leitura previstos («ansiedade social generalizada»);
//       Contraste NEGATIVO é informativo (padrão atípico) e (x||'') apagá-lo-ia
//       tal como apagaria os zeros.
//   · ⚠ «Não interpretável» (mais de 2 omissos numa escala) chega como a string
//     'n.i.' e é gravado tal e qual — NUNCA convertido em 0. A distinção entre
//     média 0 e média não interpretável é clínica.
//   · ⚠ Formatar como TEXTO SIMPLES no Sheet as colunas SIAS_Media, SPS_Media e
//     Contraste (decimais; a locale pt-PT converte "2,42" em data). O painel do
//     questionário recalcula sempre a partir da coluna Respostas e nunca lê estas
//     colunas — são para leitura humana e exportação.
//   · DEDUPE_KEYS['SIAS_SPS'] — dedupe de 4 elementos (Secção 33): Código + Data +
//     PreenchidoPor + NomePreenche, que resolvem para 'Informante' e 'NomeInformante'
//     pelos DEDUPE_ALIASES já existentes. Nenhum alias criado ou alterado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos —
//     diff auditado: 0 remoções de conteúdo (1 vírgula acrescentada ao fim da
//     entrada SGRS de DEDUPE_KEYS, para permitir a continuação).
//
// ALTERAÇÕES v112.0 — DIVA-5 operacional para três informadores.
//   O DIVA-5 é aplicado ao próprio (Adultez + Infância), ao parceiro (só Adultez)
//   e aos pais (só Infância), em separado e com o MESMO código de paciente. A vista
//   composta do painel cruza as três submissões numa grelha de 18 critérios × N
//   informadores, o que exige que as respostas item-a-item cheguem e voltem intactas.
//   · HEADERS['DIVA5'] — 4 colunas ACRESCENTADAS NO FIM (posições 1–14 intactas,
//     'Respostas' continua na coluna 14): 'CritérioA', 'CritérioB', 'RespAdultez',
//     'RespInfancia'. Reconstroem o estado dos critérios no painel após sincronizar.
//     ⚠ REQUER acção manual: escrever estes 4 cabeçalhos em O1:R1 da aba DIVA5.
//   · buildRow — branch DIVA5 devolve agora 18 valores. Guardas != null nos quatro
//     campos novos: RespAdultez/RespInfancia = 0 significa «coluna não avaliada» e é
//     precisamente o valor que faz o painel devolver INDETERMINADO em vez de
//     «Não preenche critérios». Com ||'' o zero desaparecia e a submissão do parceiro
//     passaria a ser lida como infância avaliada e negativa.
//   · doPost — garantirColunaTexto_(sh,'Respostas') antes do append, SÓ para o DIVA5:
//     força a coluna a texto ('@') para que o locale pt-PT não coaja a string
//     "Sim|Não;Sim|Não;..." dos 18 segmentos.
//   · doGet — ramo novo ?verificar=1 → verificarEntrega_(): devolve APENAS
//     {ok, respostasOk}. Permite ao respondente confirmar a entrega apesar do
//     mode:'no-cors', sem lhe devolver ao browser as submissões dos outros
//     informadores do mesmo caso (que um GET normal devolveria).
//   · SEM DEDUPE_KEYS para o DIVA5 — deliberado. O upsert sobrescreveria linhas em
//     caso de colisão de chave, e neste instrumento preservar submissões distintas
//     vale mais do que evitar duplicados: um duplicado vê-se e corrige-se, um
//     apagamento silencioso não. Mantém-se o appendRow.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos —
//     diff auditado: 0 remoções de conteúdo (2 linhas alteradas apenas para
//     acrescentar vírgula de continuação).
//
// ALTERAÇÕES v111.0 — adição mínima da GCSA (Grelha de Caracterização da
//   Seletividade Alimentar; Ricardina Correia, 2026), nos seus dois ficheiros:
//     · GCSA        — grelha principal, 98 itens (86 Likert 0–3 + 12 dicotómicos),
//                     blocos 02 a 09 mais notas finais, heterorrelato parental.
//     · GCSA_Diario — módulo de diário de sete dias (bloco 10), registo prospetivo
//                     de 35 refeições e do repertório alimentar aceite.
//   Instrumento de construção INTERNA (Via C): os itens dos seis blocos de observação
//   foram redigidos de raiz em português europeu a partir dos domínios cobertos pela
//   Escala de Avaliação do Comportamento Alimentar (LABIRINTO), sem reprodução literal
//   de itens, instruções ou material protegido. O sistema de cotação, o modelo
//   interpretativo e a estrutura dimensional são construções originais.
//   · HEADERS['GCSA'] — 67 colunas. Índices de densidade (ID) e de saliência (IS) para
//     as 15 subdimensões do perfil, mais 3D e ACO-D reportadas em separado; contagens
//     dos 4 blocos de relato médico; 5 sinalizadores clínicos; 2 marcadores de triagem;
//     7 descritores de configuração; observações por bloco; notas finais; Respostas.
//   · HEADERS['GCSA_Diario'] — 21 colunas com os 9 indicadores descritivos do diário.
//   · ⚠ SEM aferição normativa, SEM pontuação clínica e SEM pontos de corte. As bandas
//     descritivas (0–20 · 20–40 · 40–65 · 65–100 do IS) organizam a leitura dos dados e
//     NÃO classificam gravidade. Nenhum valor é devolvido à família: a grelha mantém-se,
//     para quem a preenche, o registo qualitativo que declara ser (Decisão D-01).
//   · ⚠ Guardas != null OBRIGATÓRIAS: neste instrumento o ZERO é resultado legítimo —
//       ID = 0 e IS = 0 → dimensão sem indicadores registados (achado, não ausência);
//       CFG_Zeros = 15 → todos os domínios preservados, leitura válida;
//       CFG_Amplitude = 0 → perfil sem diferenciação entre domínios;
//       contagens dos blocos médicos a 0 → ausência de sintomatologia relatada.
//     Um padrão (x||'') apagaria silenciosamente todos estes casos.
//   · ⚠ Subdimensão não interpretável (omissos acima do limiar de 20 %, Decisão D-06)
//     chega como string vazia e é gravada tal e qual — NUNCA convertida em 0.
//   · ⚠ FORMATAR NO SHEET COMO «TEXTO SIMPLES» todas as colunas com decimais —
//     ID_*, IS_*, CFG_ISmax, CFG_ISmin, CFG_Amplitude, TaxaRecusa, PropNucleo e
//     MediaPorDia: a locale pt-PT converte "66,67" em data. O painel clínico
//     RECALCULA sempre a partir de «Respostas».
//   · ⚠ Blocos 02 (mastigação/deglutição) e 05 (sintomas digestivos) são de âmbito
//     MÉDICO (Decisão D-05): geram contagem descritiva e sinalizadores, não integram
//     qualquer índice psicológico e não recebem banda. Destinam-se à articulação com
//     a Pediatria, não à leitura psicológica.
//   · DEDUPE_KEYS — dedupe de 4 elementos (Secção 33): Código + Data + PreenchidoPor +
//     NomePreenche, que resolvem para 'Informante' e 'NomeInformante' pelos
//     DEDUPE_ALIASES já existentes. Nenhum alias criado ou alterado. A chave é
//     indispensável: a grelha convida explicitamente ao registo de leituras divergentes
//     entre progenitores (Decisão D-07), pelo que mãe e pai, no mesmo dia e para a
//     mesma criança, TÊM de gerar 2 linhas distintas — é essa comparação que o painel
//     usa para calcular o índice de divergência por subdimensão.
//   · ABA — 14 aliases novos. Nenhum alias existente foi tocado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS)
//     intactos — diff auditado: 0 remoções de conteúdo.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL
//     permanente ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v110.0 — adição mínima do PDRA-9 (Perfil Diferencial da Restrição
//   Alimentar; Ricardina Correia, 2026), nas suas duas formas paralelas:
//     · PDRA-9/C — autorrelato da criança, 8–14 anos, 9 itens, escala 0–3.
//     · PDRA-9/P — heterorrelato parental, criança dos 6 aos 14 anos, escala 0–5.
//   Instrumento ORIGINAL de construção inspirada (Via B): NÃO é a Nine Item ARFID
//   Screen (NIAS; Zickgraf & Ellis, 2018, Appetite, 123, 32–42), não é tradução da
//   NIAS e os resultados NÃO são comparáveis com dados obtidos com a NIAS nem com as
//   suas versões validadas noutras línguas. A titularidade da NIAS pertence a
//   H. Zickgraf; nenhum item, norma ou ponto de corte da NIAS foi reproduzido.
//   · HEADERS['PDRA9_C'] e HEADERS['PDRA9_P'] — 29 colunas cada, estrutura idêntica:
//     Data, Código, NomeCriança, Idade, Forma, Informante, NomeInformante, Momento,
//     S_bruto, A_bruto, R_bruto, S_IE, A_IE, R_IE, S_Banda, A_Banda, R_Banda,
//     S_Saliente, A_Saliente, R_Saliente, nSalientes, Delta, Configuração,
//     Dominância, Total, Validade, Omissões, ItensOmissos, Respostas.
//   · ⚠ Guardas != null OBRIGATÓRIAS: neste instrumento o ZERO e os valores NEGATIVOS
//     são resultados legítimos e informativos —
//       S_IE = 0 → endossamento nulo da dimensão (achado, não ausência de dado);
//       Delta negativo → predomínio NÃO sensorial;
//       Omissões = 0 → protocolo completo;
//       nSalientes = 0 → «Sem dimensão saliente», leitura válida.
//     Um padrão (x||'') apagaria silenciosamente todos estes casos.
//   · ⚠ SEM prorrateio: com 3 itens por dimensão, um único omisso invalida a
//     subescala. Os campos da dimensão invalidada chegam como string vazia e são
//     gravados tal e qual — NUNCA convertidos em 0. Validade traz «INCOMPLETO».
//   · ⚠ FORMATAR NO SHEET COMO «TEXTO SIMPLES» as colunas com decimais — S_IE, A_IE,
//     R_IE e Delta: a locale pt-PT converte "13,3" em data. O painel clínico
//     RECALCULA sempre a partir de «Respostas».
//   · ⚠ SEM normas portuguesas e SEM estudo psicométrico próprio. Os limiares
//     (saliência 40 %, tendência 12 pp, dominância 23 pp, divergência 25 pp) são
//     RACIONAIS e exploratórios, não empíricos, e não são pontos de corte.
//   · ⚠ ASSIMETRIA PROBATÓRIA: uma elevação documenta o endossamento da dimensão pelo
//     informante; uma não-elevação documenta a não-endossação por aquele informante,
//     NÃO a ausência do fenómeno. Máxima na dimensão R da Forma P — o conteúdo
//     antecipatório é experiência interna e o heterorrelato parental subestima-o de
//     forma sistemática. Divergência criança > progenitor em R é ESPERADA e é
//     informação clínica, não erro de medida.
//   · DEDUPE_KEYS — dedupe de 4 elementos (Secção 33): Código + Data + PreenchidoPor +
//     NomePreenche, que resolvem para 'Informante' e 'NomeInformante' pelos
//     DEDUPE_ALIASES já existentes. Nenhum alias criado ou alterado. As duas formas
//     têm abas distintas, pelo que criança e progenitor nunca colidem; a chave garante
//     que mãe e pai, no mesmo dia, geram 2 linhas distintas no PDRA9_P.
//   · ABA — 16 aliases novos. Nenhum alias existente foi tocado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS)
//     intactos — diff auditado: 0 remoções de conteúdo.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL
//     permanente ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v109.0 — adição mínima da CAPS (Escala de Perfecionismo de Crianças e
//   Adolescentes), nas suas duas formas independentes:
//     · CAPS-22 — autorrelato da criança (Flett, Hewitt, Boucher, Davidson & Munro,
//       1997/2001; Flett et al., 2016). Via A. 22 itens, escala 1–5, 6–18 anos,
//       administração assistida com leitura dos itens em voz alta.
//     · CAPS-PR — heterorrelato do progenitor (Bento Teixeira, Pereira & Macedo, 2025,
//       Psychologica, 68, e068004; acesso aberto). Via A. 9 itens, escala 1–5.
//   · HEADERS['CAPS22'] — 39 colunas: Data, Código, NomeCriança, Sexo, Idade,
//     Informante, NomeInformante, Administração, SOP, SPP, Total,
//     SOP_z, SOP_T, SOP_Pct, SOP_Banda, SOP_Descritor,
//     SPP_z, SPP_T, SPP_Pct, SPP_Banda, SPP_Descritor,
//     SOP_z_Mista, SOP_Banda_Mista, SPP_z_Mista, SPP_Banda_Mista,
//     SOP_Prorrateado, SPP_Prorrateado, SOP_Prorrateado_4, SOP_SF, SPP_SF,
//     R_SOP, R_SPP, Class_R_SOP, Class_R_SPP, Validade, Configuração,
//     Omissões_SOP, Omissões_SPP, Respostas.
//   · HEADERS['CAPS_PR'] — 20 colunas: Data, Código, NomeCriança, Sexo, Idade,
//     Informante, NomeInformante, SPP_PR, SOP_PR, Total_PR,
//     SPP_PR_z, SPP_PR_Banda, SPP_PR_POMP, SOP_PR_z, SOP_PR_Banda, SOP_PR_POMP,
//     TOT_PR_z, TOT_PR_Banda, TOT_PR_POMP, Respostas.
//   · ⚠ Guardas != null OBRIGATÓRIAS em toda a linha: nestes instrumentos o ZERO e os
//     valores NEGATIVOS são resultados legítimos e informativos —
//       z negativo → posição abaixo da média normativa (bandas 1 e 2);
//       Omissões_SOP = 0 e Omissões_SPP = 0 → protocolo completo;
//       R_SOP / R_SPP = 0 → padrão de resposta perfeitamente coerente nos invertidos;
//       SOP_Banda = 1 → marcadamente abaixo do esperado.
//     Um padrão (x||'') apagaria silenciosamente todos estes casos.
//   · ⚠ O índice pode chegar como a string 'INVÁLIDO' (omissões acima da tolerância de
//     2 por subescala, na CAPS-22; tolerância zero na CAPS-PR). É gravado tal e qual,
//     nunca convertido em 0 nem em célula vazia.
//   · ⚠ FORMATAR NO SHEET COMO «TEXTO SIMPLES» todas as colunas com decimais —
//     SOP, SPP, Total, SOP_z, SOP_T, SOP_Pct, SPP_z, SPP_T, SPP_Pct, SOP_z_Mista,
//     SPP_z_Mista, SOP_Prorrateado, SPP_Prorrateado, SOP_Prorrateado_4, R_SOP, R_SPP,
//     SPP_PR_z, SOP_PR_z, TOT_PR_z e os três POMP: a locale pt-PT converte "1,25" em data.
//     O painel clínico de cada questionário RECALCULA sempre a partir de «Respostas».
//   · ⚠ SEM pontos de corte clínicos publicados, em nenhuma versão da CAPS, e SEM
//     normas portuguesas para idade escolar (a validação de Bento et al., 2014, abrangeu
//     apenas 14–18 anos). As bandas são DESCRITIVAS, derivadas de norma comunitária
//     canadiana 6–12 anos. A referência do CAPS-PR (n = 64) NÃO constitui norma.
//   · ⚠ O SPP-PR NÃO é indicador do SPP da criança: correlaciona-se com o perfecionismo
//     do próprio informante e não com o SPP autorrelatado (r = .127, n.s.).
//   · DEDUPE_KEYS — dedupe de 4 elementos (Secção 33): Código + Data + PreenchidoPor +
//     NomePreenche, que resolvem para as colunas 'Informante' e 'NomeInformante' pelos
//     DEDUPE_ALIASES já existentes. Nenhum alias criado ou alterado. Garante que mãe e
//     pai, no mesmo dia e para a mesma criança, geram 2 linhas distintas no CAPS_PR —
//     que é precisamente a comparação entre informantes prevista pelo instrumento.
//   · ABA — 14 aliases novos. Nenhum alias existente foi tocado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS)
//     intactos — diff auditado: 0 remoções de conteúdo.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL
//     permanente ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v108.0 — adição mínima do QCF-P (Questionário de Comportamento Fraterno —
//   versão parental; Ricardina Correia, 2026). Instrumento ORIGINAL (Via B), inspirado
//   na estrutura de seis fatores do Sibling Inventory of Behavior. NÃO é o SIB, não é
//   tradução do SIB e não é equivalente ao SIB. HETERORRELATO parental: 29 itens POR
//   FILHO, até 4 filhos descritos lado a lado no MESMO protocolo.
//   · HEADERS['QCFP'] — 68 colunas: Data, Código, NomeCriança, Informante,
//     NomeInformante, ResideCom, Emparelhamento, RelacaoReferencia, IrmaoReferencia,
//     Momento, NFilhos, Filhos, ValidadeProtocolo, ColunasAtivas,
//     ColunasInterpretaveis, IndiceSimetria, DimensaoMaiorAmplitude, DesvioEspelho,
//     PerfilFratria, F1..F4 × (Nome, Validade, COMP, EMP, ENS, RIV, AGR, EVIT,
//     DIRECAO_TD, MAGNITUDE_TD, PERCECAO, LEGITIMIDADE), Respostas.
//   · ⚠ ESTRUTURA MULTI-COLUNA — 1 linha = 1 PROGENITOR × toda a fratria, nunca
//     1 linha por filho. A coluna «Respostas» usa DOIS separadores:
//        ';;' entre filhos (sempre 4 segmentos, os inativos ficam vazios)
//        '|'  entre os 29 itens de cada filho
//     Exemplo com 2 filhos:  "4|3|...|2;;5|1|...|4;;;;"
//     A coluna «Filhos» usa a mesma estrutura, com '~' dentro de cada filho:
//        "Maria~12~F~1.º;;Tomás~9~M~2.º;;;;"
//     Qualquer normalização destes separadores destrói a leitura por coluna.
//   · Uma coluna só é cotada se o filho estiver identificado (D-41). Coluna inativa
//     chega como '—' — que NÃO é o mesmo que 'n/c' (dimensão activa não cotável).
//     Os dois valores têm significados distintos e ambos são gravados tal e qual.
//   · COTAÇÃO POR MÉDIA na métrica de frequência 1–5. Dimensões de 4 itens com
//     prorating >= 3; Bloco VII (itens 25–27) SEM prorating (D-49).
//   · ⚠ SEM normas portuguesas, sem percentis, sem pontos de corte. Todas as bandas
//     são DESCRITIVAS. NENHUM VALOR DESCREVE A QUALIDADE DO EXERCÍCIO PARENTAL:
//     descreve o comportamento relatado dos filhos entre si e a estrutura da
//     descrição feita por este informador.
//   · ⚠ Guardas != null em TODOS os campos numéricos: DIRECAO_TD = 0 (tratamento
//     descrito como igual), MAGNITUDE_TD = 0, IndiceSimetria = 0 (descrição
//     indiferenciada, que é justamente o viés que a estrutura lado a lado existe
//     para expor) e DesvioEspelho = 0 (coerência perfeita) são resultados legítimos
//     e informativos que (x||'') apagaria silenciosamente.
//   · ⚠ Formatar no Sheet como «Texto simples» as colunas IndiceSimetria,
//     DesvioEspelho e todas as F*_COMP..F*_LEGITIMIDADE — o locale pt-PT converte
//     "3.5" em data. O painel clínico recalcula sempre a partir de «Respostas».
//   · DEDUPE_KEYS — dedupe de 4 elementos (Secção 33): Código + Data +
//     PreenchidoPor + NomePreenche, que resolvem para as colunas 'Informante' e
//     'NomeInformante' pelos DEDUPE_ALIASES já existentes. Nenhum alias criado ou
//     alterado. Garante que mãe e pai, no mesmo dia e para a mesma fratria, geram
//     2 linhas distintas — que é precisamente a leitura de discrepância prevista.
//   · ABA — 8 aliases novos. Nenhum alias existente foi tocado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS)
//     intactos — diff auditado: 0 remoções de conteúdo.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL
//     permanente ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v107.0 — adição mínima do QRF-C (Questionário de Relação Fraterna —
//   versão criança; Ricardina Correia, 2026). Instrumento ORIGINAL (Via B), inspirado
//   no modelo estrutural de Furman & Buhrmester (1985). NÃO é o SRQ, não é tradução
//   do SRQ e não é equivalente ao SRQ. 43 itens · autorrelato · 8–16 anos.
//   · HEADERS['QRFC'] — 54 colunas: Data, Código, NomeCriança, Idade, NomeIrmão,
//     IdadeIrmão, CodigoDiade, Figura1, Figura2, Momento, Informante, NomeInformante,
//     E1..E17, CALOR, CONFLITO, POLO_PROPRIO, POLO_IRMAO, ESTATUTO, INTENSIDADE,
//     DIR_F1, MAG_F1, DIR_F2, MAG_F2, RIVALIDADE, RIV_MEDIA, CONFIG_PARC,
//     ASSIM_INTERPAR, LEGIT_F1, LEGIT_F2, SATISFACAO, IMPORTANCIA, DP_A, MEDIA_A,
//     PCT_MEDIO, SINALIZACAO, ITENS_RESP, VALIDADE, Respostas.
//   · COTAÇÃO POR MÉDIA na métrica 1–5 (nunca somas). Escalas de 3 itens admitem
//     prorating com >= 2 respostas; escalas de 2 itens NÃO admitem prorating.
//     Escala não cotável chega como 'n/c' — nunca como 0, nunca como vazio.
//   · ⚠ SEM normas portuguesas, sem percentis, sem pontos de corte clínicos.
//     Todas as bandas são DESCRITIVAS, ancoradas na métrica de resposta 1–5.
//   · ⚠ Guardas != null em TODOS os campos numéricos: ESTATUTO = 0 (simetria),
//     DIR_F1/DIR_F2 = 0 (ausência de parcialidade), MAG_* = 0, RIVALIDADE = 0,
//     DP_A = 0 (protocolo invariante, invalidante) e PCT_MEDIO = 0 são resultados
//     legítimos e clinicamente informativos que (x||'') apagaria silenciosamente.
//   · ⚠ Formatar no Sheet as colunas E1..E17, CALOR, CONFLITO, POLO_*, ESTATUTO,
//     INTENSIDADE, DIR_*, MAG_*, RIVALIDADE, RIV_MEDIA, ASSIM_INTERPAR, LEGIT_*,
//     SATISFACAO, IMPORTANCIA, DP_A, MEDIA_A e PCT_MEDIO como «Texto simples» —
//     o locale pt-PT converte "3.5" em data. O painel clínico recalcula sempre a
//     partir da coluna Respostas, pelo que a leitura não depende destas colunas.
//   · DEDUPE_KEYS — dedupe de 4 elementos (Secção 33) com discriminante próprio:
//     Código + Data + NomeIrmao + NomePreenche. Neste instrumento o discriminante
//     NÃO é o respondente (é sempre o próprio, em autorrelato) mas o IRMÃO-ALVO:
//     uma aplicação = uma díade, e a mesma criança pode preencher vários protocolos
//     no mesmo dia, um por irmão. Sem esta chave, o 2.º protocolo sobrescreveria o 1.º.
//   · DEDUPE_ALIASES — acrescentada a chave NOVA 'NomeIrmao'. Nenhum alias existente
//     foi criado, alterado ou removido; nenhum instrumento já existente muda de
//     comportamento de dedupe.
//   · ABA — 8 aliases novos. Nenhum alias existente foi tocado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS)
//     intactos — diff auditado: 0 remoções de conteúdo.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL
//     permanente ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v106.0 — adição mínima do CBQ-SF (Children's Behavior Questionnaire —
//   Short Form; Putnam & Rothbart, 2006; trad. PT Franklin, Soares, Sampaio, Santos
//   & Veríssimo, 2003). 94 itens · Likert 1–7 + NA · 15 escalas · 7 dimensões.
//   · HEADERS['CBQ_SF'] — 38 colunas: Data, Código, NomeCriança, DataNasc, Sexo,
//     Idade, Informante, NomeInformante, ValidadeProtocolo, PctOmissos,
//     NEscalasValidas, DP_Respostas, Invariancia, PadraoResposta, M_NA, M_IF,
//     M_AE, M_FA, M_DE, M_SLR, M_ME, M_EIP, M_IM, M_CI, M_BIP, M_SP, M_TR, M_TI,
//     M_SG, D_MA_EXT, D_MA_AN, D_MA_CE, D_MA_EXT4, D_MB_EXT, D_MB_AN, D_MB_CE,
//     EscalasInvalidas, Respostas.
//   · COTAÇÃO POR MÉDIA na métrica 1–7 (convenção de Rothbart): itens invertidos
//     recodificados 8 − x; NA e omissos EXCLUÍDOS do denominador, nunca cotados 0.
//     Escala válida com <= 1 omisso (6–7 itens) ou <= 2 (BIP, 8 itens).
//   · ⚠ SEM normas portuguesas: as bandas são DESCRITIVAS, ancoradas no ponto
//     neutro 4 da escala de resposta. Não existe ponto de corte clínico.
//   · Guardas != null em TODOS os campos numéricos: PctOmissos = 0 e
//     Invariancia = 0 são resultados legítimos que (x||'') apagaria.
//   · ⚠ Formatar no Sheet as colunas M_*, D_*, PctOmissos, DP_Respostas e
//     Invariancia como «Texto simples» — o locale pt-PT converte "3.57" em data.
//   · DEDUPE_KEYS — dedupe de 4 elementos (Secção 33): Código + Data +
//     PreenchidoPor + NomePreenche, que resolvem para as colunas 'Informante' e
//     'NomeInformante' pelos DEDUPE_ALIASES já existentes. Nenhum alias criado
//     ou alterado. Garante que mãe e pai, no mesmo dia, geram 2 linhas distintas.
//   · ABA — 8 aliases novos. Nenhum alias existente foi tocado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS)
//     intactos — diff auditado: 0 remoções de conteúdo.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL
//     permanente ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v104.0 — adição mínima do SMQ (Selective Mutism Questionnaire;
//   Bergman, Keller, Piacentini & Bergman, 2008), versões Pais e Professores.
//   · HEADERS['SMQ_Pais'] — 26 colunas: Data, Código, NomeCriança, Idade,
//     NomeInformante, Relação, Media_Escola, Estado_Escola, Media_Casa,
//     Estado_Casa, Media_Social, Estado_Social, Media_Total, Estado_Total,
//     Soma_Sintomas, Rastreio, Media_Interf_Crianca, Media_Desc_Crianca,
//     Media_Desc_Cuidador, Media_Interf_Global, Soma_Interferencia, IDC,
//     Disc_Social_Escola, NA_Itens, Omissos, Respostas.
//   · HEADERS['SMQ_Prof'] — 17 colunas: Data, Código, NomeCriança, Idade, Ano,
//     NomeInformante, Relação, Media_Escola_Prof, Estado_Escola_Prof,
//     Soma_Escola_Prof, Banda_Escola_Prof, Media_Interf_Prof,
//     Estado_Interf_Prof, Media_Desc_Aluno, Media_Desc_Prof, Omissos, Respostas.
//   · ESCALA INVERSA: pontuações mais BAIXAS = menor frequência de fala =
//     maior gravidade. Média 0 é um resultado clínico VÁLIDO e crítico —
//     todos os campos numéricos usam guarda != null, NUNCA (x||''), que
//     converteria silenciosamente um 0 legítimo em célula vazia.
//   · DEDUPE_KEYS — dedupe de 4 elementos (Secção 33): Código + Data +
//     Relacao + NomePreenche. Usa as chaves 'Relacao' e 'NomePreenche' dos
//     DEDUPE_ALIASES já existentes — nenhum alias foi criado ou alterado.
//   · ABA — 12 aliases novos. Nenhum alias existente foi tocado.
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS)
//     intactos — diff auditado: 0 remoções de conteúdo.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL
//     permanente ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v99.0 — SPAS_Pais / SPAS_Prof: coluna «Relação» corrigida:
//   · buildRow mapeava d.relacao, mas o HTML envia o grau de parentesco/função no
//     campo d.respondente — a coluna ficava sempre vazia e a relação perdia-se.
//   · Correção: d.relacao||d.respondente||'' em ambos os branches (aditivo).
//   · Linhas históricas mantêm «Relação» vazia (o NomeInformante está preservado);
//     as novas submissões passam a registar nome + relação.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente
//     ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v96.0 — TRF_618: colunas de brutos (mesmo padrão do v94/v95):
//   · HEADERS['TRF_618'] — 13 colunas acrescentadas NO FIM: Raw_INT, Raw_EXT, Raw_TOT,
//     Raw_I..Raw_VIII, Raw_Desatencao, Raw_HiperImp.
//   · buildRow('TRF_618') — brutos com teste explícito a null/'' (um bruto 0 é válido);
//     lê os campos planos raw* do payload com recurso a d.scores (intRaw/extRaw/totRaw/
//     scaleRaws/desatRaw/hiRaw).
//   · NOVA função acrescentarColunasRawTRF(dryRun) — migração do cabeçalho da aba
//     existente. Correr (true) primeiro, depois (false).
//   · Contexto: o TRF_618 HTML foi RECONSTRUÍDO (mapa da Tabela 2.1 coluna TRF, VI com
//     26 itens e subescalas Desatenção/Hiper-Imp verdadeiras, Total sobre os 120 itens,
//     T suspenso — normas anteriores fabricadas). ATENÇÃO: os T_* históricos da aba
//     TRF_618 vieram das normas fabricadas e não devem ser usados clinicamente.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente
//     ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v95.0 — CBCL_618: colunas de brutos (mesmo padrão do v94/YSR):
//   · HEADERS['CBCL_618'] — 11 colunas acrescentadas NO FIM: Raw_INT, Raw_EXT,
//     Raw_I..Raw_VIII. (Raw_TOT não é novo: o CBCL já enviava rawTotal — ver nota abaixo.)
//   · buildRow('CBCL_618') — brutos com teste explícito a null/'' (um bruto 0 é válido).
//   · NOVA função acrescentarColunasRawCBCL(dryRun) — a aba existente precisa de migração
//     do cabeçalho, tal como no YSR. Correr (true) primeiro, depois (false).
//   · Contexto: no HTML do CBCL as escalas IV e V têm o T suspenso (tabelas dimensionadas
//     para um mapa de itens errado); o Sheet passa a receber os brutos por escala.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente
//     ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v94.0 — YSR_1118: colunas de brutos:
//   · HEADERS['YSR_1118'] — 12 colunas acrescentadas NO FIM (a seguir a 'Respostas'):
//     Raw_INT, Raw_EXT, Raw_TOT, Raw_I..Raw_VIII, Raw_Outros. Acrescentadas ao fim de
//     propósito: inseri-las antes de 'Respostas' desalinharia as linhas históricas.
//   · buildRow('YSR_1118') — os brutos usam _rw() com teste explícito a null/'':
//     um bruto 0 é válido e (0||'') devolveria string vazia.
//   · NOVA função acrescentarColunasRawYSR(dryRun) — getOrCreateSheet só escreve o
//     cabeçalho em abas vazias, por isso a aba existente precisa desta migração.
//     Correr acrescentarColunasRawYSR(true) e só depois (false).
//   · Motivo: as tabelas normativas do YSR no HTML não correspondem ao perfil publicado
//     e as notas T ficaram suspensas. O painel passa a trabalhar sobre brutos.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente
//     ...OHQRMLLL/exec) — nunca novo deployment.
//
// ALTERAÇÕES v93.0 — adição da GAD-7 — Escala de Ansiedade Generalizada (Spitzer, Kroenke, Williams & Löwe, 2006):
//   · Autorrelato, 7 itens, escala ordinal 0–3, período de referência: últimos 14 dias, ≥ 12 anos.
//     Instrumento UNIDIMENSIONAL: total 0–21, sem subescalas, sem itens invertidos e sem ponderações.
//   · HEADERS['GAD7'] — 21 colunas: Data, Código, NomeCriança, Idade, Sexo, Informante, NomeInformante,
//     Momento, Contexto, N_Respondidos, Soma, Total, Prorratado, Validade, Banda, Rastreio, Pct_Max,
//     Itens_GE2, Max_Item, Item_Mais_Elevado, Respostas.
//   · ABA — 6 aliases (canónico + variações) → 'GAD7'.
//   · DEDUPE_KEYS['GAD7'] = ['Código','Data','PreenchidoPor','NomePreenche'] — dedupe de 4 elementos
//     (Secção 33). Resolve para as colunas 'Informante' e 'NomeInformante' pelos DEDUPE_ALIASES já
//     existentes — NENHUM alias foi alterado, pelo que nenhum instrumento existente muda de comportamento.
//   · buildRow['GAD7'] — guardas `!= null` em todos os campos numéricos: Total=0, Soma=0, Itens_GE2=0 e
//     Max_Item=0 são resultados válidos («Ansiedade mínima» / «Nunca») e `||` converteria zeros genuínos em ''.
//     Pct_Max é enviado como número (uma casa decimal) — a coerção decimal→data da locale pt-PT não se aplica
//     porque o valor não é string.
//   · Ponto de corte (Total ≥ 10) e bandas descritivas (0–4 · 5–9 · 10–14 · 15–21) são calculados no HTML;
//     o Sheet apenas regista. NÃO existem normas portuguesas — bandas descritivas de Spitzer et al. (2006).
//   · Diff estritamente aditivo: zero remoções; nenhum instrumento existente foi tocado.
//
// ALTERAÇÕES v92.0 — adição da AIS-8 — Escala de Insónia de Atenas (Soldatos, Dikeos & Paparrigopoulos, 2000/2003):
//   · Autorrelato, 8 itens, escala ordinal 0–3, período de referência: último mês, ≥ 12 anos.
//     Itens 1–5 = índice noturno (AIS-5, 0–15) · itens 6–8 = índice diurno (0–9) · Total 0–24.
//     Todos os itens directos: SEM itens invertidos e sem ponderações.
//   · HEADERS['AIS_8'] — 16 colunas: Data, Código, NomeCriança, NomeInformante, Informante, Idade, Sexo,
//     Momento, Total, Noturno, Diurno, Banda, Rastreio, ItensMaiorIgual2, ItensIgual3, Respostas.
//   · ABA — 6 aliases (canónico + variações) → 'AIS_8'.
//   · DEDUPE_KEYS['AIS_8'] = ['Código','Data','PreenchidoPor','NomePreenche'] — dedupe de 4 elementos
//     (Secção 33). Resolve para as colunas 'Informante' e 'NomeInformante' pelos DEDUPE_ALIASES já
//     existentes — NENHUM alias foi alterado, pelo que nenhum instrumento existente muda de comportamento.
//   · buildRow['AIS_8'] — guardas `!= null` em todos os campos numéricos: Total=0 é resultado válido
//     («Ausência de insónia») e `||` converteria zeros genuínos em ''. Todos os valores são inteiros,
//     pelo que não há risco de coerção decimal→data pela locale pt-PT.
//   · Ponto de corte (Total ≥ 6) e bandas descritivas (0–5 · 6–9 · 10–15 · 16–24) são calculados no HTML;
//     o Sheet apenas regista. Sem normas portuguesas; leitura exploratória em adolescentes.
//   · Formatar as colunas Idade e Sexo do Sheet como Texto simples.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente ...OHQRMLLL/exec) — nunca novo deployment.
//   · Diff estritamente aditivo — nenhum instrumento existente alterado.
//
// ALTERAÇÕES v91.0 — adição da SGRS — Sohn Grayson Rating Scale (Sohn & Grayson, 2005):
//   · Escala de rastreio/sistematização de observação (58 itens, 6 domínios, Likert 1–4, SEM itens invertidos; amplitude 58–232).
//     Sem normas portuguesas; bandas globais = as dos autores originais. Classificação por domínio = convenção descritiva, sem base normativa.
//   · HEADERS['SGRS'] — 35 colunas: Data, Código, NomeCriança, DataNasc, Idade, NomeInformante, Relação, LocalExame,
//     Respondidos, Omissos, S_Soma..M_Idx (6 domínios × soma/média/índice), Total_Bruto, Total_Prorrateado,
//     Pontuacao_Utilizada, Base_Cotacao, Banda, N_Sinalizados, Respostas.
//   · ABA — 6 aliases (canónico + variações) → 'SGRS'.
//   · DEDUPE_KEYS['SGRS'] = ['Código','Data','Relacao','NomePreenche'] — dedupe de 4 elementos (Secção 33):
//     código + data + tipo de respondente (Relação) + nome do respondente. Suporta pais + professor + clínico em paralelo.
//   · DEDUPE_ALIASES — acrescentada a chave NOVA 'Relacao' (nenhum alias existente foi alterado, pelo que
//     nenhum instrumento já existente muda de comportamento de dedupe).
//   · buildRow['SGRS'] — guardas `!= null` em todas as somas/médias/índices (preservam zeros genuínos).
//     Médias e índices são gravados como texto pt-PT ("2,29") — formatar essas colunas do Sheet como Texto simples.
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente ...OHQRMLLL/exec) — nunca novo deployment.
//   · Diff estritamente aditivo — nenhum instrumento existente alterado.
//
// ALTERAÇÕES v90.0 — Diário de Episódios migrado para MODELO POR EPISÓDIO (1 linha = 1 episódio):
//   · Antes (v81): modelo AGREGADO — 1 linha por paciente com todos os episódios num JSON (Episodios/FrequenciaCategorias/DistribuicaoIntensidade).
//     O HTML nunca chegou a submeter nesse modelo, pelo que a aba estava vazia (sem perda de dados na migração).
//   · Agora: os pais registam cada episódio no painel do paciente e cada «Guardar» envia UMA linha para o Sheet;
//     o painel clínico do próprio HTML (?clinico=CNS2024) acumula os episódios numa tabela, atualizando a cada sincronização.
//   · HEADERS['DIARIO_EPISODIOS'] — 14 colunas: Data, Hora, Código, NomeCriança, Informante, NomeInformante,
//     Intensidade, Categorias, OQueAconteceu, RespostaCriança, RespostaCuidadores, EpisodioID, Timestamp, Respostas.
//   · DEDUPE_KEYS['DIARIO_EPISODIOS'] = ['Código','EpisodioID'] — episódio novo → nova linha; edição do mesmo episódio → atualiza a linha (idempotente).
//   · DEDUPE_ALIASES — acrescentado alias 'EpisodioID'. ABA e mapeamento no RC_Avaliacao_Pacientes intactos.
//   · buildRow['DIARIO_EPISODIOS'] reescrito para o modelo por episódio (guardas defensivas nos nomes de campo).
//   · Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente ...OHQRMLLL/exec) — nunca novo deployment.
//   · Diff estritamente aditivo nos restantes instrumentos — nenhum outro instrumento alterado.
//
// ALTERAÇÕES v89.0 — adição da Prova «O Cuidar e a Integridade do Corpo» (story-stems abertos; Ricardina Correia, 2026):
//   · Prova projetiva idiográfica aplicada pela psicóloga (idade escolar ≈6–11); não-normativa, leitura descritiva (não cotação).
//   · HEADERS['CUIDAR_CORPO'] — 14 colunas: Data, Código, NomeCriança, Informante, NomeInformante, Idade,
//     AX1_Pos, AX2_Pos, AX3_Pred, AX3_Sec, AX4_Pos, Reparacao, PerfilResumo, Respostas.
//   · ABA — 7 aliases → 'CUIDAR_CORPO'. DEDUPE_KEYS — dedupe de 4 elementos.
//   · buildRow — branch para 'CUIDAR_CORPO'; posições 1–5 nos eixos + coping (pred/sec) + reparação.
//   · Diff estritamente aditivo — nenhum instrumento existente alterado.
//
// ALTERAÇÕES v88.0 — adição da Entrevista adaptada CAARMS (Experiências Psicóticas Atenuadas, Dissociação e Funcionamento Subjetivo):
//   · Entrevista semiestruturada aplicada pela psicóloga (10 domínios; orientadora/descritiva, não diagnóstica).
//   · HEADERS['CAARMS_ADAP'] — 32 colunas: Data, Código, NomeCriança, Informante, NomeInformante, Idade,
//     IGAD, IGAD_Bruto, Soma_Total, Banda_IGAD, D1_Idx..D10_Idx, D1_Soma..D10_Soma, Sinalizadores, Respostas.
//   · ABA — 7 aliases (canónico + variações) → 'CAARMS_ADAP'.
//   · DEDUPE_KEYS — dedupe de 4 elementos: Código+Data+PreenchidoPor(=Informante)+NomePreenche(=NomeInformante).
//   · buildRow — branch para 'CAARMS_ADAP'; guardas `!= null` preservam zeros genuínos (IGAD, índices e somas por domínio).
//   · Diff estritamente aditivo — nenhum instrumento existente alterado.
//
// ALTERAÇÕES v87.0 — adição da família ACE-Q (Experiências Adversas na Infância; 2 instrumentos):
//   · Autorrelato (Adolescente, 18 itens) e Cuidador (15 itens), escala de frequência 0–2.
//   · HEADERS['ACE_Q_ADOLESCENTE'] e HEADERS['ACE_Q_CUIDADOR'] — 15 colunas cada:
//     Data, Código, NomeCriança, NomeInformante, Informante, Relação, Total, Classificação, D1..D6, Respostas.
//   · ABA — 8 aliases (2 canónicos + variações minúsculas/hífen) → 'ACE_Q_ADOLESCENTE' / 'ACE_Q_CUIDADOR'.
//   · DEDUPE_KEYS — dedupe robusta de 4 elementos (Secção 33): Código+Data+PreenchidoPor(=Informante)+NomePreenche(=NomeInformante).
//   · buildRow — branch partilhado para ambas as abas; guardas `!= null` preservam scores 0 (Total e D1..D6).
//   · Todos os outros instrumentos (HEADERS, ABA, buildRow, DEDUPE_KEYS) intactos — diff auditado: 0 remoções de conteúdo
//     (apenas 1 vírgula acrescentada ao fim da entrada CBCL_618 de DEDUPE_KEYS).
//
// ALTERAÇÕES v86.0 — correcção do buildRow['SCARED_R_PAIS'] (0 gravado como célula vazia):
//   · O Total e as 11 subescalas usavam o padrão `X || ''`, que converte o score 0 em ''.
//   · Substituído pela verificação `!= null` (idioma já usado em RSES / TSOC_YGTSS) — preserva o 0.
//   · Campos corrigidos: Total, sub_Panico, sub_AG, sub_AS, sub_FS, sub_FE_total, sub_POC, sub_PSPT,
//     fe_FobiaEscola, fe_Situacional, fe_Sangue, fe_Animais.
//   · Só afecta submissões FUTURAS; linhas já existentes não são alteradas.
//   · HEADERS e restantes instrumentos intactos — 22 elementos = 22 colunas; diff auditado: 12↔12, 0 remoções.
//
// ALTERAÇÕES v84.0 — adição da TS-OC Parte I — YGTSS (Yale Global Tic Severity Scale; Leckman et al., 1989):
//   · HEADERS['TSOC_YGTSS'] — 24 colunas:
//     Data · Código · NomeCriança · NomeInformante · Informante · Idade · Timestamp ·
//     [Atual] SubtotalMotor · SubtotalFonico · TotalTiques · Comprometimento · IndiceComp · Global · Banda · Predominio · Proporcionalidade ·
//     [Pior]  SubtotalMotor · SubtotalFonico · TotalTiques · Comprometimento · IndiceComp · Global · Banda · Respostas
//   · ABA aliases: 'TSOC_YGTSS','tsoc_ygtss','TSOC-YGTSS','YGTSS','ygtss'
//   · buildRow para 'TSOC_YGTSS' — preserva 0 nos subtotais/totais/índices Atual e Pior (verificação != null)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v83.0 — adição de dois instrumentos de sono:
//   • CSHQ-PT (Pais) — Children's Sleep Habits Questionnaire (Silva et al., 2013):
//     · HEADERS['CSHQ_PT_Pais'] — 18 colunas:
//       Data · Código · NomeCriança · Sexo · Idade · NomeInformante · Relacao ·
//       Sub1..Sub8 · IPS · Rastreio · Respostas
//     · ABA aliases: 'CSHQ_PT_Pais','cshq_pt_pais','CSHQ_PT','CSHQ-PT','CSHQ'
//     · buildRow para 'CSHQ_PT_Pais' — preserva 0 nas 8 subescalas e no IPS (verificação != null)
//   • SSR-PT — Sleep Self-Report (auto-relato) (Owens et al., 2000):
//     · HEADERS['SSR_PT'] — 19 colunas:
//       Data · Código · NomeJovem · AnoEscolaridade · NomeInformante · Relacao ·
//       RegrasSono · ProblemasSono · GostaDormir · RD·IS·DS·AS·DN·PA·SD · Total · RastreioTotal · Respostas
//     · ABA aliases: 'SSR_PT','ssr_pt','SSR-PT','SSR'
//     · buildRow para 'SSR_PT' — preserva 0 nas 7 subescalas e no Total (verificação != null)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v82.0 — adição da GAI (Grelha de Automonitorização Interocetiva, Ricardina Correia 2026; instrumento ad-hoc):
//   • HEADERS['GAI'] — 12 colunas:
//     Data · Código · NomeCriança · DataNasc · Informante · NomeInformante ·
//     EIXO_SOMATICO · EIXO_APETITIVO · ALERTAS · MARCADORES_NUTRICIONAIS · OUTRA_COISA · Respostas
//   • ABA aliases: 'GAI','gai','GAI_Interocetiva','GAI_Jovem'
//   • buildRow para 'GAI' — preserva 0 em EIXO_SOMATICO/EIXO_APETITIVO/ALERTAS (verificação != null);
//     dedupe de 4 elementos suportado (Informante + NomeInformante), preparando a futura variante de pais.
//   Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente) — nunca novo deployment.
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v81.0 — adição do SNAP-IV (Versão Reduzida DSM-IV, Swanson et al. 2000/2012; versão PT: Octávio Moura):
//   • HEADERS['SNAP_IV'] — 18 colunas:
//     Data · Código · NomeCriança · NomeInformante · Informante · Idade · Sexo · Ano ·
//     DESAT_TOTAL · DESAT_N · DESAT_MEDIA · HI_TOTAL · HI_N · HI_MEDIA · COMB_TOTAL · COMB_N · COMB_MEDIA · Respostas
//   • ABA aliases: 'SNAP_IV','snapiv','SNAP-IV','SNAPIV','SNAP4'
//   • buildRow para 'SNAP_IV' — preserva 0 em todos os totais/N/médias (verificação != null);
//     métrica = média por item (Desatenção 1–9, Hiperatividade-Impulsividade 10–18, Combinada 1–18)
//   Reimplantar como NOVA VERSÃO do deployment existente (mesma URL permanente) — nunca novo deployment.
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v80.0 — adição do MABC-2 Lista de Verificação (Movement ABC-2 Checklist, Henderson, Sugden & Barnett):
//   • HEADERS['MABC2_Checklist'] — 14 colunas:
//     Data · Código · NomeCrianca · Idade · AnoEscolaridade · Informante · NomeInformante · Relação ·
//     SubtotalA · SubtotalB · TotalMotor · SimC · Flags · Respostas (43 posições: 15 Secção A + 15 Secção B + 13 Secção C)
//   • ABA aliases: 'MABC2_Checklist','mabc2_checklist','MABC2','MABC-2','MABC_2_Checklist','MABC2_LV'
//   • buildRow para 'MABC2_Checklist' — preserva 0 em SubtotalA/SubtotalB/SimC (verificação != null);
//     TotalMotor fica vazio quando não calculável (>3 NO numa secção)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v79.0 — adição da bateria SPPCS (Self-Perception Profile for College Students, Neemann & Harter 2012):
//   • HEADERS['SPPCS'] — 41 colunas:
//     Data · Código · NomeEstudante · Idade · Sexo · CursoAno · Informante · NomeInformante ·
//     AP_CT…AP_AEG (13 autoperceções) · IMP_CT…IMP_CA (12 importâncias) ·
//     SS_AmigoIntimo…SS_OrgAcademicas (5 fontes de apoio social) ·
//     NDominios4 · DiscrepGlobal · Respostas (98 posições: 54 «Como Eu Sou» + 24 Importância + 20 «As Pessoas na Minha Vida»)
//   • ABA aliases: 'SPPCS','sppcs','SPPCS_Bateria','Harter_SPPCS','SPP-CS'
//   • buildRow para 'SPPCS' — preserva 0 nos 30 scores e em NDominios4/DiscrepGlobal (verificação != null)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v78.0 — adição da bateria SPPLD (Self-Perception Profile for Learning Disabled Students, Renick & Harter 1988/2012):
//   • HEADERS['SPPLD'] — 32 colunas:
//     Data · Código · NomeAluno · Informante · NomeInformante · Idade · Sexo · AnoEsc ·
//     M_CIG…M_AutoestimaGlobal (10) · IMP_CIG…IMP_Conduta (9) ·
//     NDominiosImportantes · DiscrepanciaMedia · DominiosVulneraveis · GruposComparacao (9 valores 1/2) ·
//     Respostas (64 posições: 46 «Como Eu Sou» + 18 Importância)
//   • ABA aliases: 'SPPLD','sppld','SPPLD_Bateria','Harter_SPPLD','SPP-LD'
//   • buildRow para 'SPPLD' — preserva 0 nos 19 scores e em NDominiosImportantes/DiscrepanciaMedia (verificação != null)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v77.0 — adição da bateria SPPC (Self-Perception Profile for Children, Harter 2012) e da Escala do Professor:
//   • HEADERS['SPPC'] — 22 colunas:
//     Data · Código · NomeCriança · Informante · NomeInformante · Idade · Sexo · AnoEsc ·
//     M_Escolar…M_AutoestimaGlobal (6) · IMP_Escolar…IMP_Comportamental (5) ·
//     NAreasValorizadas · AreasVulneraveis · Respostas (46 posições: 36 Parte I + 10 Parte II)
//   • HEADERS['SPPC_Professor'] — 12 colunas:
//     Data · Código · NomeCriança · Informante · NomeInformante · AnoEsc · P_Escolar…P_Comportamental (5) · Respostas (15 posições)
//   • ABA aliases: 'SPPC','sppc','SPPC_Bateria','Harter_SPPC' / 'SPPC_Professor','sppc_professor','SPPC_PROFESSOR'
//   • buildRow para 'SPPC' (preserva 0 nos 11 scores e em NAreasValorizadas) e para 'SPPC_Professor' (preserva 0 nos 5 P_*)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v76.0 — adição do SPPA (Self-Perception Profile for Adolescents, Harter 1988/2012; bateria única):
//   • HEADERS['SPPA'] — 29 colunas:
//     Data · Código · NomeJovem · Informante · NomeInformante · Idade · Sexo · AnoEsc ·
//     M_Escolar…M_AutoestimaGlobal (9) · IMP_Escolar…IMP_AmizadesIntimas (8) ·
//     NAreasValorizadas · AreasVulneraveis · AnoUS · Respostas (61 posições: 45 Parte I + 16 Parte II)
//   • ABA aliases: 'SPPA','sppa','SPPA_Bateria','Harter_SPPA'
//   • buildRow para 'SPPA' — preserva 0 nos 17 scores e em NAreasValorizadas/AnoUS (verificação != null)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v75.0 — adição do CABS (Escala de Comportamento Assertivo para Crianças, Michelson & Wood 1982):
//   • HEADERS['CABS_Auto'] e HEADERS['CABS_Hetero'] — 14 colunas idênticas:
//     Data · Código · NomeCriança · Informante · NomeInformante · Idade ·
//     NA_Total · Passivo · Agressivo · Assertivo · Class_Total · Class_Passivo · Class_Agressivo · Respostas
//   • ABA aliases: 'CABS_Auto','cabs_auto','CABS_Autorrelato','CABS_AUTO' + equivalentes Hetero
//   • buildRow partilhado para CABS_Auto/CABS_Hetero — preserva 0 nos 4 scores (verificação != null)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos — diff auditado: 0 remoções.
//
// ALTERAÇÕES v72.0 — adição da RSES (Escala de Auto-Estima de Rosenberg):
//   • HEADERS['RSES'] — 13 colunas:
//     Data · Código · NomeJovem · Idade · Sexo · Contexto · NomeRespondente ·
//     Total · Zscore · Percentil · Classificacao · Grupo · Respostas
//   • ABA aliases: 'RSES','rses','RSES_PT','Rosenberg'
//   • buildRow para 'RSES' — preserva 0 em Total/Zscore/Percentil (verificação != null)
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) intactos.
//
// ALTERAÇÕES v70.0 — adição da família CARS2 (3 instrumentos):
//
//   ÁREA: Despiste neurodesenvolvimento
//
//   • CARS2-HP — Escala Avaliação Integrativa Espetro Autismo (Versão Funcionamento Elevado)
//     Adaptação inspirada (Via B) na CARS2-HF (Schopler et al., 2010, WPS)
//     Display: CARS2-HP · Interno: EARI-AF · ≥6a, QI≥80, verbal funcional
//     Cotação clínica por psicólogo · 15 domínios escala 1.0-4.0 (passos 0.5)
//     Soma 15-60 · Cortes (Vaughan 2011; Dawkins et al. 2016): 27.5 / 33.5
//     · HEADERS['CARS2_HP'] — 24 colunas (D1..D15 + Total/Categoria/DominiosCriticos/NCriticos)
//     · ABA aliases: 'CARS2_HP','cars2_hp','CARS2-HP','EARI-AF','EARI_AF','eari_af'
//     · buildRow para 'CARS2_HP' — preserva null em domínios não cotados
//
//   • CARS2-QPC — Questionário Parental (Caregiver)
//     Adaptação inspirada (Via B) na CARS-2 QPC (Schopler et al., 2010, WPS)
//     Display: CARS2-QPC · Interno: EARI-QP · parent/cuidador-completed
//     81 itens em 15 domínios · Likert 0-4 + N/A · direction-aware scoring
//     33 itens (+) esperado 0-1=preoc · 48 itens (−) atípico 3-4=preoc
//     Qualitativo: %/domínio + sinalização ≥50% + categoria clínica
//     · HEADERS['CARS2_QPC'] — 50 colunas (pct_dom_1..15 + sinal_dom_1..15)
//     · ABA aliases: 'CARS2_QPC','cars2_qpc','CARS2-QPC','EARI-QP','EARI_QP','eari_qp'
//     · buildRow para 'CARS2_QPC' — dedupe por código+data+nome_informante
//
//   • CARS2-ST — Versão Standard (Crianças mais novas / QI baixo / verbal limitada)
//     Adaptação inspirada (Via B) na CARS-2 ST (Schopler et al., 2010, WPS)
//     Display: CARS2-ST · Interno: EARI-AS · <6a OU QI≤79 OU verbal limitada/ausente
//     Cotação clínica por psicólogo · 15 domínios escala 1.0-4.0 (passos 0.5)
//     Soma 15-60 · Cortes (Schopler 1980; Chlebowski et al. 2010; Schopler et al. 2010): 29.5 / 36.5
//     · HEADERS['CARS2_ST'] — 26 colunas (inclui QIEstimado + NivelVerbal)
//     · ABA aliases: 'CARS2_ST','cars2_st','CARS2-ST','EARI-AS','EARI_AS','eari_as'
//     · buildRow para 'CARS2_ST' — preserva null em domínios não cotados
//
//   Todos os outros instrumentos (HEADERS, ABA aliases, buildRow) e
//   restantes blocos do script mantidos sem alterações.
//
// ALTERAÇÕES v69.0 — adição da família C-SSRS (3 versões) + M-CHAT-R/F
//
//   ÁREA NOVA: Despiste neurodesenvolvimento (M-CHAT-R/F)
//
//   • C-SSRS-P — Escala de Avaliação Dimensional do Risco Suicidário
//     Versão Pediátrica · Ricardina Correia (2026) · 6–11 anos
//     Aplicação por entrevistador clínico · Auto + Heteroavaliação
//     17 itens × 2 janelas (Vida + 3 meses) · Bloco B com 5 itens (escala 0–2 · soma 0–10)
//     Cortes B: Baixa 0-3 · Média 4-6 · Alta 7-10
//     Classificação hierárquica conservadora (integração auto + hetero pelo critério mais grave):
//       Mínimo → Baixo → Moderado → Elevado → Crítico
//     · HEADERS['C_SSRS_P'] — 29 colunas (inclui Tipo + Convivencia/FreqContacto)
//     · ABA aliases: 'C_SSRS_P','c_ssrs_p','C-SSRS-P','cssrsp','CSSRSP'
//     · buildRow para 'C_SSRS_P' — preserva 0 em campos numéricos vazios
//
//   • C-SSRS-A — Versão Adolescente · Ricardina Correia (2026) · 12–18 anos
//     Auto-administrada com supervisão clínica · SÓ Autoavaliação (sem hetero)
//     17 itens × 2 janelas · Bloco B com 5 itens (escala 1–5 · soma 5–25)
//     Cortes B: Baixa 5-10 · Média 11-17 · Alta 18-25
//     Mesma classificação hierárquica do C-SSRS-P
//     · HEADERS['C_SSRS_A'] — 27 colunas (SEM Convivencia/FreqContacto)
//     · ABA aliases: 'C_SSRS_A','c_ssrs_a','C-SSRS-A','cssrsa','CSSRSA'
//     · buildRow para 'C_SSRS_A' — Tipo defaulta a 'Autoavaliação'
//
//   • C-SSRS-DC — Versão Défice Cognitivo · Ricardina Correia (2026)
//     Aplicável a qualquer idade c/ limitação de auto-relato
//     (perturbação do neurodesenvolvimento, demência, lesão cerebral)
//     Aplicação por entrevistador com suportes visuais · Auto + Hetero
//     INOVAÇÃO: Bloco A inclui terceira opção "Não compreende" (snnc — Sim/Não/NC)
//       — NC não conta como Sim (não eleva nivelA, não activa Bloco B)
//       — NC não conta como Não (regista indeterminação clínica formal)
//     Bloco B REDUZIDO a 3 itens (Frequência, Controlabilidade, Razões para viver)
//       escala 0–2 · soma 0–6 · Cortes: Baixa 0-2 · Média 3-4 · Alta 5-6
//     · HEADERS['C_SSRS_DC'] — 29 colunas (idêntico ao C_SSRS_P; NC fica codificado em Respostas JSON)
//     · ABA aliases: 'C_SSRS_DC','c_ssrs_dc','C-SSRS-DC','cssrsdc','CSSRSDC'
//     · buildRow para 'C_SSRS_DC' — schema idêntico ao C_SSRS_P
//
//   • M-CHAT-R/F — Modified Checklist for Autism in Toddlers (Revised, with Follow-Up)
//     © 2009 Diana Robins, Deborah Fein, & Marianne Barton
//     Tradução PT-PT: Carla Cintrão Almeida
//     ÁREA NOVA: Despiste neurodesenvolvimento (PEA)
//     16–30 meses (idade em MESES, não anos — convenção própria deste instrumento)
//     Preenchido pelos pais com supervisão clínica · 2 etapas:
//       Etapa 1: 20 itens Sim/Não com algoritmo de cotação dirigido por item
//         · Items 2, 5, 12 → "Sim" = Falha (risco)
//         · Todos os outros itens → "Não" = Falha (risco)
//         · Categorias: Baixo 0-2 · Moderado 3-7 · Alto 8-20
//       Etapa 2 condicional (só se score 3-7):
//         · Entrevista de seguimento estruturada para cada item falhado
//         · Clínico regista por item: Esclarecido (Passa · 0) / Confirmado (Falha · 1)
//         · ≥2 confirmados → Moderado — Positivo (rastreio positivo)
//         · 0-1 confirmados → Moderado — Negativo (rastreio negativo após esclarecimento)
//     Conformidade com a licença Robins/Fein/Barton:
//       · instrumento usado na totalidade (20/20 itens, sem subset)
//       · sem modificações aos itens, instruções ou ordem
//       · créditos visíveis no landing card e footers de todos os PDFs
//       · tradução Carla Cintrão Almeida creditada em todo o lado
//     · HEADERS['M_CHAT_R_F'] — 18 colunas
//     · ABA aliases: 'M_CHAT_R_F','m_chat_r_f','M-CHAT-R-F','M-CHAT-R/F',
//                   'M-CHAT-RF','MCHAT','mchat','MCHATRF','mchatrf'
//     · buildRow para 'M_CHAT_R_F' — ScoreE2 fica vazio se etapa 2 não administrada
//
//   Todos os outros instrumentos (HEADERS, ABA aliases, buildRow) e
//   funcionalidades permanecem inalterados.
//
// ALTERAÇÕES v68.0 — remoção da família EADRS (Risco Suicidário)
//
//   • Família EADRS (Escala de Avaliação Dimensional do Risco Suicidário) —
//     versões EADRS-P (Pediátrica), EADRS-A (Adolescente) e EADRS-DC
//     (Défice Cognitivo) — removidas do RC e do Apps Script. Aliases ABA,
//     schemas HEADERS e blocos buildRow correspondentes eliminados.
//     Demais instrumentos intactos.
//
// ALTERAÇÕES v67.0 — adição do ISS-I / ESI (Inventário de Sintomas de Stress Infantil)
//
//   • ISS-I / ESI — Lucarelli & Lipp (1998) · adaptação técnica PT-PT
//     6-14 anos · Versão Criança (autorrelato) · 33 itens Likert 0-4
//     4 domínios: F (Reações Físicas, 1-9), P (Reações Psicológicas, 10-18),
//     D (Reações Psic. Comp. Depressivo, 19-27), PF (Reações Psicofisiológicas, 28-33)
//     Bandas criteriais (% do máximo): ≤25 Esperado · 26-45 Ligeiro ·
//     46-65 Moderado · >65 Elevado · TOTAL máximo 132
//     4 itens sentinela (22, 23, 24, 25 — alerta clínico se resposta ≥ 2)
//     SEM normas portuguesas — leitura criterial + desenvolvimental por faixa
//     etária (6-8 / 9-11 / 12-14 anos). Matriz desenvolvimental × bandas
//     codificada no HTML (mat_dev + mat_sent).
//
//   • Aliases em ABA (6 novas): ISS_ESI, iss_esi, ISS-I/ESI, ISS-I, ISSI, ESI
//
//   • Storage local no HTML: localStorage 'iss_esi_sessoes_v1' (fallback offline)
//
// ⚠️ URL PERMANENTE — NUNCA criar nova implementação:
//    AKfycbxX2_Ry7VRH6jr7eGBMmtmyZFXZc69blwdO5bqJK0j69HRSexpXXPuEfDC5OHQRMLLL
//
// ALTERAÇÕES v66.0 — remoção da PELED-RC, PECN-RC, PELED-R e PECN-R
//
//   • Família PELED (Prova Estruturada de Leitura/Escrita Diferencial) e
//     família PECN (Prova Estruturada de Cognição Numérica) removidas do
//     RC e do Apps Script. Aliases ABA e blocos buildRow correspondentes
//     eliminados. Demais instrumentos intactos.
//
// ALTERAÇÕES v62.0 — adição do MDQ — adição do MDQ
// (Mood Disorder Questionnaire — instrumento de rastreio para
// perturbações do espectro bipolar).
//
//   • MDQ — Hirschfeld et al. (2000); validação PT-BR Gurgel et al. (2012).
//           Auto-aplicação em adultos (≥18 anos) · 15 itens · ~3-5 min.
//           Estrutura:
//             · Parte 1 (1-13): sintomas maníacos/hipomaníacos (Sim/Não)
//             · Parte 2 (14):   co-ocorrência temporal (Sim/Não)
//             · Parte 3 (15):   impacto funcional (4 níveis: 0-3)
//           Cotação:
//             · Soma_P1 = soma itens 1-13 (0-13)
//             · Classificação principal: RASTREIO POSITIVO,
//               Sintomatologia bipolar incompleta, Zona subclínica,
//               Rastreio negativo
//             · 6 clusters conceptuais (C1-C6): Activação somática,
//               Cognição acelerada, Expansividade hedónica,
//               Pressão comunicacional, Disforia/Irritabilidade,
//               Desregulação comportamental
//             · 4 alertas diferenciais: TDAH adulto, Borderline/
//               Cluster B, Características Mistas, Confounding por
//               Substâncias
//           Privacidade: nomes de domínios/clusters NUNCA visíveis
//           ao paciente — apenas no painel clínico.
//
//     • Aliases em ABA: MDQ (canónico) + variante mdq.
//
// ALTERAÇÕES v61.0 — adição do STAXI-NA
// (State-Trait Anger Expression Inventory para Crianças e Adolescentes).
// Auto-relato 9-18 anos · 32 itens · escala Likert 1-3 · sem inversões.
//
//   • STAXI_NA — Del Barrio, Aluja & Spielberger (2004);
//                tradução PT Ana Nunes (sem validação psicométrica
//                formal — uso restrito a investigação).
//                Estrutura paginada em 3 partes com escalas
//                de resposta distintas:
//                  · Parte I  (1-8):  Estado actual
//                  · Parte II (9-16): Habitual
//                  · Parte III(17-32): Quando-zangado
//                8 subescalas (4 itens cada) → 4 escalas globais:
//                  · Estado de Raiva    (SR  + RFV)
//                  · Raiva-Traço        (TR  + RR)
//                  · Expressão da Raiva (EROUT + ERIN)
//                  · Controlo da Raiva  (CROUT + CRIN) — adaptativa
//                Tipologia diferencial {ADAPTATIVO, RISCO_GLOBAL,
//                EXTERNALIZACAO, TRACO_CONTIDO, DEFICE_CONTROLO,
//                TIPICO}.
//                Normativos brasileiros (Costa & Frizzo, 2012)
//                — referência aproximativa.
//
//     • Aliases em ABA: STAXI_NA (canónico) + variantes
//       STAXI-NA / staxina.
//
// ALTERAÇÕES v60.0 — adição do ERQ-CA
// (Emotion Regulation Questionnaire for Children and Adolescents).
// Auto-relato 10-18 anos · 10 itens · escala Likert 1-5 · sem inversões.
//
//   • ERQ_CA — Gullone & Taffe (2012); adaptação do ERQ adulto
//              de Gross & John (2003); tradução PT Ana Nunes
//              (sem validação psicométrica formal — uso restrito
//              a investigação).
//              2 subescalas baseadas no modelo processual de
//              regulação emocional de Gross (1998):
//                · Reavaliação Cognitiva (RC, 6 itens) — adaptativa
//                · Supressão Expressiva (SE, 4 itens) — menos adaptativa
//              Tipologia combinada (RC × SE):
//                {ADAPTATIVO, RISCO, MISTO, SUBUTILIZACAO, TIPICO}.
//              Painel clínico permite alternar entre 6 grupos
//              normativos (Global / 10-12 / 13-15 / 16-18 /
//              Masculino / Feminino) — Gullone & Taffe (2012, N=827).
//
//     • Aliases em ABA: ERQ_CA (canónico) + variantes ERQ-CA / erqca.
//
// ALTERAÇÕES v59.0 — adição do ERICA
// (Emotion Regulation Index for Children and Adolescents).
// Auto-relato 9-16 anos · 16 itens · escala Likert 1-5.
//
//   • ERICA — MacDermott et al. (2010); adaptação PT
//             Reverendo & Machado (2010, FPCEUC).
//             3 subescalas: Controlo Emocional (CE, 7 itens),
//             Autoconsciência Emocional (AE, 5 itens),
//             Responsividade Situacional (RS, 4 itens).
//             10 itens com cotação invertida (5,7,8,9,10,11,12,
//             13,14,16) — inversão aplicada no HTML antes do POST.
//             Polaridade simplificada: alta = adaptativo.
//             Tipologia diferencial {ADAPTATIVO_GLOBAL,
//             DESREGULACAO_GLOBAL, DEFICE_CE/AE/RS,
//             DEFICES_MULTIPLOS, TIPICO}.
//
//     • Aliases em ABA: ERICA (canónico) + variantes lowercase.
//
// ALTERAÇÕES v58.0 — adição dos 3 questionários CERQ
// (Cognitive Emotion Regulation Questionnaire · Garnefski et al.)
// Modelo: 9 estratégias cognitivas de regulação emocional após acontecimentos
// adversos (5 adaptativas + 4 maladaptativas) + 2 factores de 2.ª ordem
// (CERQ-Positivo, CERQ-Negativo) + tipologia diferencial (5 perfis).
//
//   • CERQ_K  — 36 itens · Crianças 9-11 anos (Garnefski et al., 2007)
//                9 subescalas com 4 itens cada (em blocos sequenciais).
//   • CERQ_18 — 18 itens · ≥ 13 anos (Soares & Amaral, 2024 — versão PT curta)
//                8 subescalas (RPP funde Reavaliação+Planeamento, 4 itens).
//   • CERQ_36 — 36 itens · ≥ 12 anos (Garnefski & Kraaij, 2006;
//                adaptação PT Castro et al., 2013) · 9 subescalas intercaladas.
//
//   Todas: escala Likert 1-5 · sem itens invertidos · tipologia
//   {ADAPTATIVO, RISCO, MISTO, SUBUTILIZACAO, TIPICO}.
//
//     • Aliases em ABA: CERQ_K / CERQ_18 / CERQ_36 (canónicos)
//       + variantes lowercase.
//
// ALTERAÇÕES v57.0 — adição dos 3 questionários IIM
// (Inventário de Inteligências Múltiplas · Howard Gardner 1983/1995).
// Versões paralelas com mesmo motor de cotação (8 inteligências, 8 índices,
// 8 perfis sequenciais, 9 alertas independentes).
//
//   • IIM_Hetero       — 64 itens · heterorrelato (pais/professores)
//   • IIM_Criancas     — 64 itens · auto-relato infantil (8-12 anos)
//   • IIM_AdolAdultos  — 64 itens · auto-relato adolescentes/adultos (≥13)
//
//   Todas: 8 subescalas (LING, LOGM, ESPA, MUSI, CORP, INTER, INTRA, NATU)
//   · 8 índices (IIA, IIES, IIP, IIN, IGM, IDE, DIE, DOM) · perfis P1-P8
//   first-match · alertas RED/YEL/GRE coexistentes · escala Likert 1-5.
//
//     • Aliases em ABA: IIM_Hetero / IIM_Criancas / IIM_AdolAdultos
//       (canónicos) + variantes lower/dash/sync-key.
//
// ALTERAÇÕES v56.0 — adição dos 2 questionários ecológicos
// (Versão clínica revista · enquadramento bioecológico de
// Bronfenbrenner + lógica multi-informador ASEBA/Achenbach).
//
//   • QEE_Escola — 40 itens fechados + 4 qualitativos · DT/professor
//   • QEP_Pais   — 40 itens fechados + 4 qualitativos · pais/cuidadores
//
//   Ambos: 8 escalas (4 clínicas: SR, SI, RC, PDP · 4 adaptativas:
//   IPS, FAA/FAG, ACA, FPC/FPF) · 6 índices (II, IE, IPD, IAG, IRP,
//   IGPC) · pontos de corte racionais · 1 item invertido por instrumento.
//   Itens qualitativos guardados em colunas separadas (QualA-D).
//
// ALTERAÇÕES v55.0 — adição das 4 versões REDUZIDAS dos PALS
// (Patterns of Adaptive Learning Scales · Midgley et al. 2000).
// Mantêm a mesma estrutura factorial das versões completas
// (mesmas subescalas, índices, perfis e alertas) com menos itens.
//
//   • PALS_Parent_Red       — 21 itens (vs 37 completo)
//   • PALS_Teacher_Red      — 20 itens (vs 38 completo)
//   • PALS_Student_Sec_Red  — 46 itens (vs 84 completo)
//   • PALS_Student_23c_Red  — 46 itens (vs 84 completo)
//
//   Headers, índices clínicos, polaridades e eixos motivacionais
//   são idênticos às versões completas — só muda o nome da aba.
//
// ALTERAÇÕES v54.0 — correcção de bug crítico no buildRow ERC
// (Pais/Professores). O padrão `d.X || d.Y || ''` colapsava
// para '' quando d.X era 0 ou null (ex: payload com NaN
// stringificado como null no JSON), perdendo silenciosamente
// scores legítimos. Substituído por verificação null-safe que
// só cai para fallback se valor for undefined/null/''.
// Adicionada também leitura de `sexo_crianca` (chave usada pelo
// HTML do ERC_Pais) — coluna SexoCriança deixa de ficar vazia.
//
// ALTERAÇÕES v53.0 — adição dos 4 questionários PALS
// (Patterns of Adaptive Learning Scales · Midgley et al. 2000,
// adaptação portuguesa não-validada · uso clínico exploratório).
//
//   • PALS_Parent — 37 itens · 8 subescalas (P1.1-P4) ·
//     2 polaridades macro (POP, PCEP) · 9 índices clínicos
//     (IFP, IPCA, IRPA, ICEFM, ICEFP, IRPF, IIP, IPI, IDC) ·
//     7 perfis (PP1-PP7) · extras: relacao, idade_crianca,
//     ano_escolar.
//
//   • PALS_Teacher — 38 itens · 7 subescalas (T1.1-T4) ·
//     2 polaridades macro (PCS, PCI) · 5 índices (IFD, ICA,
//     ICP, IRP, IRBD) · 6 perfis (TP1-TP6) · extras: relacao,
//     disciplina, anos_experiencia.
//
//   • PALS_Student_Sec — 84 itens · 18 subescalas (A1-D4) ·
//     5 índices (IFAA, IRM, IEA, IDPCm, IDPCp) · 4 eixos
//     (approx, evit, dom, desemp) · 8 perfis (P1-P8 inclui
//     foco vocacional) · extras: idade, ano_escolar, genero.
//     Faixa: 14-18 anos (Secundário).
//
//   • PALS_Student_23c — 84 itens · estrutura idêntica ao
//     Sec mas linguagem adaptada em B3/C5/C6/C7 · 7 perfis
//     (P1-P7, sem foco vocacional). Faixa: 10-14 anos.
//
//   Notas técnicas:
//     • Payload sem chave 'data' top-level (Skill 31).
//     • Scores enviados como M_<subescala>, P_<polaridade>,
//       I_<índice>, E_<eixo>. Subescalas Parent (P1.1-P2.3)
//       enviadas com '_' em vez de '.' (M_P1_1, M_P1_2, etc).
//     • Aliases em ABA: PALS_Parent / PALS_Teacher /
//       PALS_Student_Sec / PALS_Student_23c (canónicos)
//       + variantes minúsculas e com hífen.
//
// ALTERAÇÕES v52.0 — adição do Sociograma · Mapa Social
// (Moreno 1934; Coie & Dodge 1988; Bronfenbrenner 1979).
//
//   • SOCIOGRAMA — Sociograma informal e entrevista ecológica
//     · HEADERS['SOCIOGRAMA'] — 18 colunas:
//         Data | Código | NomeCriança | NomeInformante |
//         TipoRespondente | Idade | AnoTurma | TempoTurma |
//         DensidadeApoio | Reciprocidade | SinaisExclusao |
//         SentidoPertenca | AdultoConfianca | NRefugios |
//         NEvitados | DiscrepanciaSelfOther | Flags | Respostas
//     · ABA aliases: 'SOCIOGRAMA','sociograma','Sociograma',
//                    'SOCIOGRAMA_v1','sociograma_v1'
//     · buildRow para 'SOCIOGRAMA' — preserva null em
//       SentidoPertenca e DiscrepanciaSelfOther (distinção
//       clínica importante: 0 ≠ "sem resposta").
//
//   Notas clínicas importantes:
//     • Instrumento qualitativo/relacional — sem T-scores
//       nem percentis. Indicadores são contagens/Likert directos:
//         - DensidadeApoio (n confidentes em A1∪A2)
//         - Reciprocidade (sobreposição B1∩B2)
//         - SinaisExclusao (n nomes em C1+C2+C3)
//         - SentidoPertenca (0-10, smiley · F1)
//         - AdultoConfianca ('sim:nome' / 'nao' / vazio · F2)
//         - NRefugios / NEvitados (espaços E1 / E2)
//         - DiscrepanciaSelfOther (Likert 1-5 · D3)
//     • Flags como string com '|' (ex: 'isolamento_apoio|baixa_pertenca').
//       Reconstruídas no painel clínico via .split('|').
//     • Respostas como JSON stringificado — contém:
//         A1, A2 (arrays nomes) | B1, B2, B3 (arrays nomes) |
//         C1, C2 (arrays nomes), C3 (string) | D1, D2 (3 palavras),
//         D3 (Likert) | E1, E2 (multi-select espaços), E3 (texto) |
//         F1 (Likert 0-10), F2 ({val,nome}), F3 (texto).
//     • Múltiplos respondentes: TipoRespondente distingue
//       'proprio' / 'pais' / 'professor'. Mesmo paciente pode
//       ter 3 sessões válidas (uma por respondente).
//     • Idade alvo: 6–18 anos. Não substitui sociometria formal
//       aplicada à turma; serve para entrevista clínica e
//       observação ecológica (Bronfenbrenner microssistema).
//
// ALTERAÇÕES v51.0 — adição mínima dos QACSE — Questionários
// de Avaliação de Competências Socioemocionais (Coelho &
// Sousa, 2016/2020) · auto-relato pediátrico/adolescente.
//
//   • QACSE-R — Competências Socioemocionais (versão reduzida)
//     · HEADERS['QACSE_R'] — 17 colunas:
//         Data | Código | NomeCriança | NomeRespondente |
//         Idade | Sexo | Ano | Avaliador |
//         AC | CR | IS | AS |
//         AC_cat | CR_cat | IS_cat | AS_cat |
//         Respostas
//     · ABA aliases: 'QACSE_R','qacse_r','QACSE-R','qacse-r'
//     · buildRow para 'QACSE_R'
//
//   • QACSE-C — Competências Socioemocionais (Complementar à BAS-3)
//     · HEADERS['QACSE_C'] — 19 colunas:
//         Data | Código | NomeCriança | NomeRespondente |
//         Idade | Sexo | Ano | Avaliador |
//         ACE | RE | TP | RAC | TDR |
//         ACE_cat | RE_cat | TP_cat | RAC_cat | TDR_cat |
//         Respostas
//     · ABA aliases: 'QACSE_C','qacse_c','QACSE-C','qacse-c'
//     · buildRow para 'QACSE_C'
//
//   Notas clínicas importantes:
//     • QACSE-R: 32 itens Likert 1-4 · 4 escalas (8 itens cada).
//       AC=Autocontrolo e CR=Competências Relacionais são
//       escalas de COMPETÊNCIA (alto = positivo / recurso).
//       IS=Isolamento Social e AS=Ansiedade Social são
//       escalas de DIFICULDADE (alto = preocupante).
//       Itens invertidos (5−x): AC2, AC4, AC6, CR8, IS8, AS8.
//       Cut-offs heurísticos por terços (8-32 cada escala).
//       Idade alvo: 10–16 anos.
//     • QACSE-C: 40 itens Likert 1-4 · 5 escalas (8 itens cada).
//       Todas as escalas são COMPETÊNCIA (alto = positivo):
//         ACE = Autoconsciência Emocional
//         RE  = Regulação Emocional
//         TP  = Tomada de Perspetiva
//         RAC = Resolução Assertiva de Conflitos
//         TDR = Tomada de Decisão Responsável
//       Itens invertidos: ACE4,6,8 / RE4,6,8 / TP4,6,8 /
//       RAC4,6 / TDR3,6.
//       Cut-offs únicos: Baixa 8-16 / Média 17-24 / Elevada 25-32.
//       Cobre dimensões CASEL ausentes da BAS-3 — instrumento
//       complementar (consultar grelha integrativa).
//       Idade alvo: 10–17 anos.
//     • Ambos: campo NomeRespondente preenchido (mesmo sendo
//       auto-relato — manter consistência com skill v27).
//     • Respostas item-a-item gravadas como JSON (chave:valor)
//       na coluna Respostas; reconstrução no painel clínico
//       via JSON.parse(row.Respostas) (Secção 28 da skill).
//     • Ficheiros HTML: QACSE_R_v1.html · QACSE_C_v1.html
//     • SyncKeys no RC: qacse_r · qacse_c
//
//   Todos os outros instrumentos (HEADERS, ABA aliases, buildRow)
//   e funções utilitárias (getOrCreateSheet, jsonResponse,
//   parseData, doPost, doGet, lerAba) permanecem ABSOLUTAMENTE
//   INALTERADOS relativamente à v50.0.
//
// ALTERAÇÕES v50.0 — formalização da recepção do BSI —
// Inventário de Sintomas Psicopatológicos (Derogatis, 1982;
// versão portuguesa: Canavarro, 1995/1999) ·
// auto-relato adulto (≥13 anos), 53 itens Likert 0-4.
//
//   • BSI — Sintomatologia Psicopatológica (adultos/adolescentes)
//     · HEADERS['BSI'] — 18 colunas (alinhadas com BSI_v1.html):
//         Data | Codigo | NomeCrianca | NomeInquirido | GrauParentesco |
//         IGS | TSP | ISP |
//         Som | ObsComp | SensInt | Dep | Ans | Hos |
//         AnsFob | IdeaPar | Psic |
//         Answers
//     · ABA aliases: 'BSI','bsi','BSI_v1'
//     · buildRow para 'BSI'
//
//   Notas clínicas importantes:
//     • Auto-relato adulto/adolescente (≥13 anos); 53 itens
//       Likert 0-4 (Nunca/Poucas vezes/Algumas vezes/Muitas
//       vezes/Muitíssimas vezes); janela: últimos 7 dias.
//     • 9 dimensões primárias (Derogatis, 1982 · normas PT
//       Canavarro, 1999) — chaves do payload entre parênteses:
//         Somatização          (Som)     ·
//         Obsessões-Compulsões (ObsComp) ·
//         Sensib. Interpessoal (SensInt) ·
//         Depressão            (Dep)     ·
//         Ansiedade            (Ans)     ·
//         Hostilidade          (Hos)     ·
//         Ansiedade Fóbica     (AnsFob)  ·
//         Ideação Paranóide    (IdeaPar) ·
//         Psicoticismo         (Psic).
//       Quatro itens adicionais não pertencem a nenhuma
//       dimensão mas contam para os índices globais.
//     • 3 índices globais:
//         IGS Índice Geral de Sintomas (média de todos os 53
//             itens; equivalente ao GSI) — corte clínico ≥1.7
//             (Canavarro, 1999, amostra portuguesa);
//         TSP Total de Sintomas Positivos (nº de itens com
//             resposta ≥1; equivalente ao PST);
//         ISP Índice de Sintomas Positivos Distress (soma dos
//             itens positivos / TSP; equivalente ao PSDI).
//     • Campo NomeCrianca usado quando o BSI é aplicado a um
//       cuidador a propósito de uma criança/adolescente; em
//       auto-relato adulto puro fica vazio. NomeInquirido e
//       GrauParentesco identificam quem preenche.
//     • Respostas item-a-item gravadas como string '0|1|2|...'
//       na coluna Answers (split('|') no painel clínico).
//     • Ficheiro HTML: BSI_v1.html
//     • SyncKey no RC: bsi
//
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) e
//   funções utilitárias (getOrCreateSheet, jsonResponse,
//   parseData, doPost, doGet, lerAba) permanecem
//   ABSOLUTAMENTE INALTERADOS relativamente à v49.0.
//
// ALTERAÇÕES v49.0 — adição mínima do OCI-R — Inventário
// Obsessivo-Compulsivo Revisto (Foa, Huppert, Leiberg, Hajcak,
// Langner, Kichic & Salkovskis, 2002 · Psychol Assessment
// 14(4):485-496) · Versão portuguesa: Cardoso (2015),
// Universidade Lusófona — estrutura de 6 fatores correlacionados
// confirmada.
//
//   • OCI-R — Sintomatologia Obsessivo-Compulsiva (adultos)
//     · HEADERS['OCI_R'] — 15 colunas:
//         Data | Código | NomePaciente |
//         Idade | Sexo | DataAplicacao |
//         Total | Lavagem_Raw | Verificacao_Raw | Ordem_Raw |
//         Acumulacao_Raw | Obsessoes_Raw | Neutralizacao_Raw |
//         Categoria | Respostas
//     · ABA aliases: 'OCI_R','oci_r','OCI-R','ocir','OCIR'
//     · buildRow para 'OCI_R'
//
//   Notas clínicas importantes:
//     • Auto-relato adulto (≥18 anos); 18 itens Likert 0-4
//       (De maneira alguma/Um pouco/Moderadamente/Muito/
//       Extremamente); janela: último mês; sem inversões.
//     • 6 subescalas (Foa et al., 2002 · estrutura PT confirmada
//       por Cardoso, 2015 — 3 itens × 0-12 cada):
//         Lavagem        (7,13,18 · corte ≥5) ·
//         Verificação    (8,10,15 · corte ≥6) ·
//         Ordem          (1,11,16 · corte ≥7) ·
//         Acumulação     (2,5,14  · corte ≥5) ·
//         Obsessões      (3,4,9   · corte ≥5) ·
//         Neutralização  (6,12,17 · corte ≥3).
//     • Pontuação Total 0-72; corte global ≥21 sugere provável POC
//       (sensibilidade 65,6% / especificidade 63,9%).
//     • 5 faixas Total:
//         0-13  Ausência/Baixa · 14-20 Ligeira (subclínica) ·
//         21-31 Moderada (provável POC) · 32-47 Marcada ·
//         48-72 Severa.
//     • Em Acumulação isoladamente elevada, considerar Perturbação
//       de Acumulação (DSM-5) como hipótese alternativa.
//     • Comorbilidades (depressão, ansiedade) podem inflacionar
//       Total — avaliar diagnóstico diferencial.
//     • Para 7-17 anos: usar OCI-CV-R (já implementado v48).
//     • Respostas item-a-item serializadas como JSON na coluna
//       Respostas (reconstrução no painel clínico via JSON.parse).
//     • Ficheiro HTML: OCI_R_v1.html
//     • SyncKey no RC: ocir
//
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) e
//   funções utilitárias (getOrCreateSheet, jsonResponse,
//   parseData, doPost, doGet, lerAba) permanecem
//   ABSOLUTAMENTE INALTERADOS relativamente à v48.0.
//
// ALTERAÇÕES v48.0 — adição mínima do OCI-CV-R — Inventário
// Obsessivo-Compulsivo Revisto para Crianças (Abramovitch,
// Abramowitz, McKay, Cham, Anderson et al., 2022 ·
// J Anxiety Disord 86:102532)
//
//   • OCI-CV-R — Sintomatologia Obsessivo-Compulsiva Pediátrica
//     · HEADERS['OCI_CV_R'] — 15 colunas:
//         Data | Código | NomeCriança | NomeInformante |
//         Idade | Sexo | GrupoIdade |
//         Total | VD_Raw | OBS_Raw | LAV_Raw | ORD_Raw | NEUTR_Raw |
//         Categoria | Respostas
//     · ABA aliases: 'OCI_CV_R','oci_cv_r','OCI-CV-R',
//                    'ocicvr','OCICVR'
//     · buildRow para 'OCI_CV_R'
//
//   Notas clínicas importantes:
//     • Auto-relato (criança/adolescente 7-17 anos); 18 itens
//       Likert 0-2 (Nunca/Às vezes/Sempre); janela: último mês.
//     • 5 subescalas (Abramovitch et al., 2022):
//         VD Verificação/Dúvida (5 itens · max 10 · corte ≥3) ·
//         OBS Obsessões         (4 itens · max 8  · corte ≥2) ·
//         LAV Lavagem           (3 itens · max 6  · corte ≥2) ·
//         ORD Ordenação         (3 itens · max 6  · corte ≥3) ·
//         NEUTR Neutralização   (3 itens · max 6  · corte ≥1).
//     • Pontuação Total 0-36; 5 faixas clínicas:
//         0-5  Ausência/Normal · 6-7  Limiar ·
//         8-13 Provável POC    · 14-21 OC marcada ·
//         22-36 OC severa.
//     • GrupoIdade: '<12' ou '>=12' (normas Abramovitch 2022 Tab 2).
//     • Respostas item-a-item serializadas como JSON na coluna
//       Respostas (reconstrução no painel clínico via JSON.parse
//       de row.Respostas — ver secção 28 da skill).
//     • Ficheiro HTML: OCI_CV_R_v1.html
//     • SyncKey no RC: ocicvr
//
// ALTERAÇÕES v47.0 — adição mínima de DOIS instrumentos de
// Perfeccionismo:
//
//   • EMP-H&F — Escala Multidimensional de Perfeccionismo
//     (Hewitt & Flett, 1991) — versão reduzida 32 itens
//     · HEADERS['EMP_HF'] — 15 colunas:
//         Data | Código | NomeCriança | NomeRespondente |
//         Idade | Sexo |
//         PAO_raw | PSP_raw | POO_raw | TOTAL_raw |
//         PAO_media | PSP_media | POO_media | TOTAL_media |
//         Respostas
//     · ABA aliases: 'EMP_HF','emp_hf','EMP-HF','EMP-H&F'
//     · buildRow para 'EMP_HF'
//
//   • EMP-F — Escala Multidimensional de Perfeccionismo
//     (Frost et al., 1990) — versão reduzida 24 itens
//     · HEADERS['EMP_F'] — 19 colunas:
//         Data | Código | NomeCriança | NomeRespondente |
//         Idade | Sexo |
//         CM_raw | DA_raw | PE_raw | PC_raw | PS_raw | O_raw |
//         CM_media | DA_media | PE_media | PC_media |
//         PS_media | O_media | Respostas
//     · ABA aliases: 'EMP_F','emp_f','EMP-F'
//     · buildRow para 'EMP_F'
//
//   Notas clínicas importantes:
//     • Ambos são auto-relato (Adolescentes / Adultos ≥ 12 anos).
//     • EMP-H&F: 3 subescalas (PAO auto-orientado · PSP socialmente
//       prescrito · POO orientado para os outros) + Total; Likert
//       1-7; interpretação por média/item (<3.0 Baixo · 3.0-4.49
//       Moderado · ≥4.50 Elevado). Inversões aplicadas no HTML
//       antes do envio.
//     • EMP-F: 6 subescalas × 4 itens (CM Preocupações com Erros ·
//       DA Dúvidas sobre Ações · PE Expectativas Parentais · PC
//       Críticas Parentais · PS Padrões Pessoais · O Organização);
//       Likert 1-5; SEM inversões; cut-offs ESPECÍFICOS por
//       subescala (CM/DA/PE ≥3.0 · PC ≥2.5 · PS ≥3.5 · O ≥4.2
//       → Elevado); SEM total global — interpretação sempre por
//       subescala.
//     • Respostas item-a-item serializadas como JSON na coluna
//       Respostas (reconstrução no painel clínico via JSON.parse
//       de row.Respostas — ver secção 28 da skill).
//     • Ficheiros HTML: EMP_HF_v1.html · EMP_F_v1.html
//     • SyncKeys no RC: emp_hf · emp_f
//
//   Todos os outros instrumentos (HEADERS, ABA, buildRow) e
//   funções utilitárias (getOrCreateSheet, jsonResponse,
//   parseData, doPost, doGet, lerAba) permanecem
//   ABSOLUTAMENTE INALTERADOS relativamente à v46.0.
//
// ALTERAÇÕES v46.0 — adição mínima do QEA — Questionário de
// Esquemas para Adolescentes (Santos, Rijo & Pinto-Gouveia, 2009)
// ALTERAÇÕES v45.0 — adição mínima do ISC-24 — Inventário de
// Somatização para Crianças (Ferreira et al., 2014).
// ALTERAÇÕES v44.0 — adição mínima da Anamnese — História Prévia
// (Ricardina Correia, 2026) · instrumento qualitativo, sem cotação.
// ALTERAÇÕES v43.0 — adição mínima do Kidcope (2 versões).
// ALTERAÇÕES v42.0 — adição mínima do CCBQ (Hernandez, 2008).
// ALTERAÇÕES v41.0 — adição mínima do PPGR-J (Correia, 2026).
// ALTERAÇÕES v40.0 — adição mínima do BAS-3 (Silva Moreno &
//                    Martorell Pallás, 1989/1995).
// ALTERAÇÕES v39.0 — consolidação de v36 + v37 + v38.
// ============================================================


// ── CABEÇALHOS POR INSTRUMENTO ──────────────────────────────
var HEADERS = {
  // ── Família EIF · Escalas de Interferência Funcional (v121.0) ──────────
  //   Geometria comum: autorrelato de 3 itens (0–30) e heterorrelato de 5 itens
  //   (0–50) em duas subescalas. Escala de resposta 0–10 em todos os itens.
  //   O total de uma escala só existe se TODOS os seus itens estiverem
  //   respondidos: não há prorrateamento nem imputação. A coluna 'Forma'
  //   distingue as duas formas dentro da mesma aba.
  //   ⚠ Guarda != null obrigatória: 0 é resultado legítimo no total, na média por
  //     domínio e no número de domínios assinalados.
  //   ⚠ O painel clínico recalcula sempre a partir de 'Respostas' (JSON): em
  //     pt-PT o Google Sheets coage decimais a datas, pelo que as colunas de
  //     média NUNCA devem ser lidas como fonte de cotação.

  // EIFP — pediátrica (Whiteside, 2009). Janela: últimos 7 dias.
  EIFP: ['Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Relação',
         'Idade', 'Forma', 'Momento', 'ProblemaAlvo',
         'C_TOTAL', 'C_MEDIA', 'C_BANDA',
         'P_SUB_I', 'P_SUB_II', 'P_TOTAL', 'P_MEDIA', 'P_BANDA',
         'N_ASSIN_C', 'N_ASSIN_P',
         'Dias_Ausencia', 'Dias_Rendimento',
         'Respostas'],

  // EIFA — adultos (Coles et al., 2014). Janela: últimos 7 dias.
  EIFA: ['Data', 'Código', 'NomeUtente', 'NomeInformante', 'Informante', 'Relação',
         'Idade', 'Sexo', 'Forma', 'Momento', 'ProblemaAlvo',
         'A_TOTAL', 'A_MEDIA', 'A_BANDA',
         'S_SUB_I', 'S_SUB_II', 'S_TOTAL', 'S_MEDIA', 'S_BANDA',
         'N_ASSIN_A', 'N_ASSIN_S',
         'Dias_Ausencia', 'Dias_Rendimento',
         'Respostas'],

  // EIFJ — comportamentos de jogo (Hodgins, 2013). Janela: ÚLTIMO MÊS (30 dias).
  //   'Referente' distingue jogo a dinheiro (CID-11 6C50) de jogo digital (6C51),
  //   entidades distintas. 'Formulacao' guarda a expressão usada na administração
  //   («o seu jogo» ou «o seu problema de jogo»), que deve manter-se constante
  //   entre momentos — sem este registo não é possível garanti-lo na reavaliação.
  EIFJ: ['Data', 'Código', 'NomeUtente', 'NomeInformante', 'Informante', 'Relação',
         'Idade', 'Sexo', 'Referente', 'Forma', 'Momento', 'Formulacao',
         'A_TOTAL', 'A_MEDIA', 'A_BANDA',
         'S_SUB_I', 'S_SUB_II', 'S_TOTAL', 'S_MEDIA', 'S_BANDA',
         'N_ASSIN_A', 'N_ASSIN_S',
         'Dias_Ausencia', 'Dias_Rendimento',
         'Respostas'],


  // ── CAARS · Conners' Adult ADHD Rating Scales — formas longas (v120.0) ──
  //   DUAS abas: CAARS_SL (auto-relato) e CAARS_OL (heterorrelato). 66 itens, 0–3.
  //   Escalas: A Problemas de Desatenção/Memória (12 itens, RB 0–36) · B Hiperatividade/
  //   Inquietação (12, 0–36) · C Impulsividade/Labilidade Emocional (12, 0–36) ·
  //   D Problemas com o Autoconceito (6, 0–18) · E Sintomas de Desatenção DSM-IV (9, 0–27) ·
  //   F Sintomas de Hiperatividade-Impulsividade DSM-IV (9, 0–27) · G Sintomas Totais de
  //   PHDA DSM-IV = E + F (18, 0–54) · H Índice de PHDA (12, 0–36).
  //   A chave de cotação é idêntica nas duas formas: 72 atribuições item→escala para 66
  //   itens, sendo que os itens 19, 23, 26, 27, 40 e 63 pertencem a duas escalas.
  //   Inconsistencia = soma dos |diferenciais| de 8 pares de conteúdo equivalente
  //   (11-49, 40-44, 20-25, 13-27, 30-47, 19-23, 6-37, 26-63); amplitude 0–24.
  //   ⚠ SEM colunas de T-score: as normas são propriedade da MHS. A conversão RB → T é
  //     feita nas folhas de perfil oficiais, pelo sexo e idade da PESSOA AVALIADA.
  //   ⚠ Guarda != null obrigatória: 0 é resultado legítimo em RB_A..RB_H e em
  //     Inconsistencia (concordância perfeita nos 8 pares).
  CAARS_SL: ['Data', 'Código', 'NomeAvaliado', 'Sexo', 'Idade', 'GrupoNormativo',
             'Informante', 'NomeInformante', 'Contexto',
             'RB_A', 'RB_B', 'RB_C', 'RB_D', 'RB_E', 'RB_F', 'RB_G', 'RB_H',
             'Inconsistencia', 'LeituraInconsistencia', 'ItensRespondidos', 'Respostas'],

  CAARS_OL: ['Data', 'Código', 'NomeAvaliado', 'Sexo', 'Idade', 'GrupoNormativo',
             'Informante', 'NomeInformante', 'TempoContacto', 'ContextoObservacao',
             'RB_A', 'RB_B', 'RB_C', 'RB_D', 'RB_E', 'RB_F', 'RB_G', 'RB_H',
             'Inconsistencia', 'LeituraInconsistencia', 'ItensRespondidos', 'Respostas'],

  // ── EII-PT · Escala de Intolerância à Incerteza (v119.0) ──
  //   DUAS abas: EII27 (versão longa, 27 itens) e EII12 (versão curta, 12 itens).
  //   As Formas A (adultos ≥ 18) e J (adolescentes 12–17) partilham a aba da respectiva
  //   versão; a coluna 'Forma' distingue-as. Escala 1–5 em todos os itens, TODOS no
  //   sentido directo — não existe um único item invertido em nenhuma das versões.
  //   Amplitudes: EII-27 Total 27–135 · F1 15–75 · F2 12–60 · EII-12 Total 12–60 ·
  //   Ansiedade Prospetiva 7–35 · Ansiedade Inibitória 5–25.
  //   A EII-12 é subconjunto ESTRITO da EII-27 (itens 7, 8, 9, 10, 11, 12, 15, 18, 19,
  //   20, 21, 25), pelo que a aba EII27 traz sempre as três escalas curtas DERIVADAS.
  //   ⚠ SEM pontos de corte e SEM normas portuguesas: as colunas *_Banda contêm bandas
  //     DESCRITIVAS por quintis do POMP (Muito baixa · Baixa · Moderada · Elevada ·
  //     Muito elevada), que descrevem posição na amplitude teórica e NÃO gravidade.
  //   ⚠ Colunas decimais (POMP, Delta_POMP, DP_Itens) — formatar como TEXTO SIMPLES no
  //     Sheet (locale pt-PT converte "2,20" em data).
  //   ⚠ Guarda != null obrigatória: 0 é resultado legítimo em POMP, Delta_POMP e
  //     DP_Itens (este último com o significado crítico de resposta invariante).
  EII27: ['Data', 'Código', 'NomeUtente', 'NomeInformante', 'Informante', 'Forma',
          'Idade', 'Contexto', 'Versao',
          'EII27_TOTAL', 'EII27_TOTAL_POMP', 'EII27_TOTAL_Banda',
          'EII27_F1', 'EII27_F1_POMP', 'EII27_F1_Banda',
          'EII27_F2', 'EII27_F2_POMP', 'EII27_F2_Banda',
          'EII12_TOTAL', 'EII12_TOTAL_POMP', 'EII12_TOTAL_Banda',
          'EII12_P', 'EII12_P_POMP', 'EII12_P_Banda',
          'EII12_I', 'EII12_I_POMP', 'EII12_I_Banda',
          'Delta_POMP', 'Polo', 'Banda_Delta', 'DP_Itens', 'Alerta',
          'Respostas'],

  EII12: ['Data', 'Código', 'NomeUtente', 'NomeInformante', 'Informante', 'Forma',
          'Idade', 'Contexto', 'Versao',
          'EII12_TOTAL', 'EII12_TOTAL_POMP', 'EII12_TOTAL_Banda',
          'EII12_P', 'EII12_P_POMP', 'EII12_P_Banda',
          'EII12_I', 'EII12_I_POMP', 'EII12_I_Banda',
          'Delta_POMP', 'Polo', 'Banda_Delta', 'DP_Itens', 'Alerta',
          'Respostas'],

  // ── PSWQ · Penn State Worry Questionnaire (v115.0) ──
  //   Meyer, Miller, Metzger & Borkovec (1990); normas portuguesas de Oliveira et al.
  //   (2021). Autorrelato, 16 itens 1–5, total 16–80 (mínimo empírico 36, máximo
  //   empírico 60 — ver nota sobre itens invertidos no changelog).
  //   Âncora normativa PRIMÁRIA: comunidade portuguesa, n = 256, M = 50,91, DP = 9,86.
  //   Critério c de significância clínica (Jacobson & Truax): 57,40 → limiar 58.
  //   Índice de mudança fiável (RCI 95%): 7,93 → limiar operacional 8 pontos.
  //   As subescalas estão ancoradas em Freitas (2017, n = 90) porque Oliveira et al.
  //   não reportam normas de subescala: os z do total e os z das subescalas NÃO são
  //   directamente comparáveis entre si.
  //   ⚠ Guarda != null obrigatória: 0 e valores NEGATIVOS são legítimos em todas as
  //     colunas de z, de percentil, de coerência e de omissões.
  //   ⚠ Colunas decimais — formatar como TEXTO SIMPLES no Sheet (locale pt-PT).
  PSWQ: ['Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'DataNasc',
         'Idade', 'Momento', 'Contexto',
         'PSWQ_Total', 'PSWQ_Media', 'PSWQ_F1', 'PSWQ_F2b', 'PSWQ_F2c',
         'PSWQ_Z_Com', 'PSWQ_Pct_Com', 'PSWQ_Banda',
         'PSWQ_Z_Cli', 'PSWQ_Pct_Cli', 'PSWQ_Z_Fre', 'PSWQ_Pct_Fre',
         'PSWQ_Z_EUA', 'PSWQ_Pct_EUA', 'PSWQ_Z_PAG', 'PSWQ_Pct_PAG',
         'PSWQ_Z_F1', 'PSWQ_Pct_F1', 'PSWQ_Z_F2b', 'PSWQ_Pct_F2b',
         'PSWQ_Coerencia', 'PSWQ_CriterioC', 'PSWQ_Omissoes', 'PSWQ_Estado',
         'Respostas'],

  // ── BAI · Inventário de Ansiedade de Beck (v114.0) ──
  //   Beck & Steer (1990/1993); validação portuguesa de Quintão, Delgado & Prieto
  //   (2013) — estrutura UNIDIMENSIONAL. Autorrelato, 21 itens 0–3, total 0–63,
  //   referido à última semana incluindo o dia de hoje.
  //   Limiares (Beck & Steer): 0–7 Mínima · 8–15 Ligeira · 16–25 Moderada · 26–63 Grave.
  //   Mudança fiável entre aplicações: Δ ≥ 7 pontos (RCI, Seggar et al., 2002).
  //   Os 4 agrupamentos (Subjetiva 1,3,6,8,12,13,19 · Neurofisiológica 4,5,9,10,14,17 ·
  //   Autonómica 7,11,15,16 · Pânico 2,18,20,21) são EXPLORATÓRIOS: as alocações de
  //   itens divergem entre estudos e a versão portuguesa é unidimensional. Guardam-se
  //   como brutos inteiros, para leitura descritiva; só o total tem cotação normativa.
  //   ⚠ Guarda != null obrigatória: 0 é resultado legítimo em qualquer destas colunas.
  BAI: ['Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Idade', 'Sexo',
        'BAI_Total', 'BAI_Class', 'BAI_SUBJ', 'BAI_NEURO', 'BAI_AUTON', 'BAI_PANICO',
        'Respostas'],

  // ── BDI-II · Inventário de Depressão de Beck II (v114.0) ──
  //   Beck, Steer & Brown (1996); versão portuguesa de Quelhas Martins & Coelho
  //   (FMUP, 2000). Autorrelato, 21 grupos de afirmações 0–3, total 0–63, referido às
  //   duas últimas semanas incluindo o dia de hoje.
  //   Limiares: 0–13 Mínima · 14–19 Ligeira · 20–28 Moderada · 29–63 Grave.
  //   Referência comunitária portuguesa: M = 11,01 (DP = 9,15; N = 2401) —
  //   Oliveira-Brochado, Simões & Paúl (2014). É uma referência DESCRITIVA e não uma
  //   tabela normativa: não se converte em percentil nem em score padronizado.
  //   Dimensões bifatoriais (Cognitivo-Afetiva itens 1–13, máx 39; Somática itens
  //   14–21, máx 24) sem cotação normativa própria — existem modelos alternativos.
  //   ⚠ BDI_Item9 em coluna própria: sinalizador de ideação suicida, ≥ 1 exige
  //     avaliação directa independentemente do total. 0 é informação, não ausência.
  //   ⚠ Assume o formulário BDI-II (≠ BDI original: itens e ordem diferem).
  BDI2: ['Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Idade', 'Sexo',
         'BDI_Total', 'BDI_Class', 'BDI_COG', 'BDI_SOM', 'BDI_Item9', 'Respostas'],

  // ── SIAS · SPS · Escalas de Ansiedade Social (v113.0) ──
  //   Mattick & Clarke (1998); versão portuguesa de Pinto-Gouveia & Salvador (2001).
  //   Autorrelato, 39 itens em escala 0–4 (0 = não é nada característico da minha
  //   maneira de ser · 4 = extremamente característico). Adolescentes a partir dos
  //   14 anos e adultos.
  //     SIAS — ansiedade em situações de INTERAÇÃO social · 19 itens · 0–76.
  //            Itens 8 e 10 invertidos (valor cotado = 4 − valor bruto).
  //     SPS  — ansiedade de ESCRUTÍNIO (fobia social) · 20 itens · 0–80.
  //            Nenhum item invertido.
  //   Resultado PRINCIPAL: a média por item de cada escala (0–4) e o CONTRASTE
  //   entre ambas (SPS − SIAS, −4 a +4). A média por item é preferida ao total
  //   por ser independente do número de itens — a SIAS circula em versões de 19 e
  //   de 20 itens, com amplitudes diferentes, e os totais publicados não são
  //   directamente comparáveis entre si. Os totais são secundários.
  //   Omissos: limite de 2 por escala (convenção operacional, ≈10 % dos itens, sem
  //   base empírica publicada). Acima do limite a média e o contraste chegam como
  //   'n.i.' e são gravados tal e qual.
  //   ⚠ Guarda != null OBRIGATÓRIA: média 0 e contraste 0 ou negativo são
  //     resultados legítimos e informativos. (x||'') apagá-los-ia.
  //   ⚠ Formatar SIAS_Media, SPS_Media e Contraste como TEXTO SIMPLES no Sheet.
  SIAS_SPS: [
    'Data', 'Código', 'NomeAvaliado', 'Idade', 'Informante', 'NomeInformante',
    'SIAS_Respondidos', 'SIAS_Omissos', 'SIAS_Total', 'SIAS_Media', 'SIAS_Estado',
    'SPS_Respondidos', 'SPS_Omissos', 'SPS_Total', 'SPS_Media', 'SPS_Estado',
    'Contraste', 'Pos_SIAS', 'Pos_SPS', 'Respostas'
  ],

  // ── GCSA · Grelha de Caracterização da Seletividade Alimentar (v111.0) ──
  //   Ricardina Correia (2026). Instrumento de construção INTERNA (Via C).
  //   98 itens: 86 em escala de frequência 0–3 (Nunca · Às vezes · Frequentemente ·
  //   Sempre) e 12 dicotómicos (bloco 08). Heterorrelato dos titulares das
  //   responsabilidades parentais.
  //   Dois descritores por subdimensão, ambos na escala 0–100:
  //     ID (densidade)  = soma dos itens válidos ÷ (3 × n.º de itens válidos) × 100
  //     IS (saliência)  = n.º de itens ≥ 2 ÷ n.º de itens válidos × 100  ← primário
  //   Nas subdimensões dicotómicas (8A) os dois coincidem.
  //   15 subdimensões no perfil: 3A 3B 3C · 4A 4B 4C · 6A 6B · 7A 7B · 8A ·
  //   ACO-P ACO-R ACO-E ACO-C. Reportadas em separado: 3D (marcadores de preservação)
  //   e ACO-D (impacto no cuidador) — fora do perfil por decisão explícita (D-04 e
  //   secção 2.4): o apetite preservado NÃO é indicador de menor gravidade e a
  //   sobrecarga do cuidador NÃO é indicador do quadro da criança.
  //   ⚠ 6A (hiper-reatividade) e 6B (procura sensorial) são ORTOGONAIS (Dunn, 1997) —
  //     calculadas de forma independente; a sua soma seria psicometricamente inválida.
  //   ⚠ SEM índice global: a média das 15 subdimensões achata perfis com elevação
  //     isolada (anomalia A-02). Em substituição, 7 descritores de configuração.
  //   ⚠ Omissos: prorrateio até 20 % por subdimensão (D-06). Acima do limiar a
  //     subdimensão é «Não interpretável», chega como string vazia e é gravada tal e
  //     qual — NUNCA convertida em 0. Subdimensões com menos de 5 itens não admitem
  //     qualquer omisso.
  //   ⚠ Guarda != null OBRIGATÓRIA: ID = 0, IS = 0, CFG_Zeros e CFG_Amplitude = 0 são
  //     resultados legítimos e informativos. (x||'') apagá-los-ia.
  //   ⚠ Formatar como TEXTO SIMPLES no Sheet todas as colunas ID_*, IS_* e CFG_IS*/
  //     CFG_Amplitude (decimais; a locale pt-PT converte-os em datas).
  GCSA: ['Data', 'Código', 'NomeCriança', 'DataNasc', 'Idade',
         'Informante', 'NomeInformante', 'PeriodoRegisto',
         'ID_3A', 'IS_3A', 'ID_3B', 'IS_3B', 'ID_3C', 'IS_3C',
         'ID_4A', 'IS_4A', 'ID_4B', 'IS_4B', 'ID_4C', 'IS_4C',
         'ID_6A', 'IS_6A', 'ID_6B', 'IS_6B',
         'ID_7A', 'IS_7A', 'ID_7B', 'IS_7B', 'ID_8A', 'IS_8A',
         'ID_ACOP', 'IS_ACOP', 'ID_ACOR', 'IS_ACOR',
         'ID_ACOE', 'IS_ACOE', 'ID_ACOC', 'IS_ACOC',
         'ID_3D', 'IS_3D', 'ID_ACOD', 'IS_ACOD',
         'MCOMP_Pres', 'MCOMP_Sal', 'MSEG_Pres', 'MSEG_Sal',
         'DFUNC_Pres', 'DFUNC_Sal', 'DDIAG_Pres', 'DDIAG_Sal',
         'SIN_DEGL', 'SIN_PICA', 'SIN_CRESC', 'SIN_IMAGEM', 'SIN_AVERS',
         'TRI_08_8', 'TRI_08_9',
         'CFG_Interpretaveis', 'CFG_Superiores', 'CFG_Zeros',
         'CFG_ISmax', 'CFG_ISmin', 'CFG_Amplitude', 'CFG_Predominante',
         'Observacoes', 'NotasFinais', 'Respostas'],

  // ── GCSA_Diario · Módulo de diário de sete dias (bloco 10, D-03) (v111.0) ──
  //   Registo PROSPETIVO, preenchido no próprio dia — é a fonte de informação
  //   quantitativa mais robusta do instrumento, por não assentar em estimativa
  //   retrospetiva. 35 slots (7 dias × 5 refeições) mais o repertório alimentar.
  //   9 indicadores descritivos:
  //     RefRegistadas · RefRecusa · TaxaRecusa · RefForaCasa ·
  //     AlimentosDistintos · NucleoEstavel (alimentos em ≥ 4 dias) ·
  //     PropNucleo · MediaPorDia · AlimentosPorDia (D1|D2|…|D7)
  //   ⚠ A literatura refere com frequência repertórios inferiores a 20 alimentos como
  //     marcador de seletividade significativa. Esse valor NÃO é operacionalizado como
  //     limiar: não existem normas portuguesas para amplitude de repertório nesta faixa
  //     etária e a sua conversão em ponto de corte contrariaria o estatuto declarado do
  //     instrumento (D-01). Os indicadores são contagens, para leitura integrada.
  //   ⚠ Guarda != null OBRIGATÓRIA: 0 refeições com recusa e núcleo estável = 0 são
  //     resultados legítimos. Diário vazio devolve string vazia nos rácios (nunca 0),
  //     por ausência de denominador.
  //   ⚠ Formatar como TEXTO SIMPLES no Sheet: TaxaRecusa, PropNucleo e MediaPorDia.
  GCSA_Diario: ['Data', 'Código', 'NomeCriança',
                'Informante', 'NomeInformante', 'PeriodoInicio', 'PeriodoFim',
                'RefRegistadas', 'RefRecusa', 'TaxaRecusa', 'RefForaCasa',
                'AlimentosDistintos', 'NucleoEstavel', 'PropNucleo', 'MediaPorDia',
                'AlimentosPorDia', 'Dias', 'Refeicoes', 'Repertorio',
                'NotasFinais', 'Respostas'],

  // ── CAPS-22 · Escala de Perfecionismo de Crianças e Adolescentes — autorrelato (v109.0) ──
  //   Flett, Hewitt, Boucher, Davidson & Munro (1997/2001) · Flett et al. (2016). Via A.
  //   22 itens, escala 1–5. Itens invertidos: 3, 9 e 18 (cotação 6 − bruto).
  //   SOP (auto-orientado) = 1, 2, 4, 6, 7, 9*, 11, 14, 16, 18*, 20, 22 — amplitude 12–60.
  //   SPP (socialmente prescrito) = 3*, 5, 8, 10, 12, 13, 15, 17, 19, 21 — amplitude 10–50.
  //   Tolerância de 2 omissões por subescala com prorrateio; acima disso o índice chega
  //   como a string 'INVÁLIDO' e é gravado tal e qual — nunca como 0 nem vazio.
  //   Norma primária por sexo + norma mista sempre em paralelo (colunas *_Mista).
  //   Bandas 1–6 DESCRITIVAS (sem pontos de corte clínicos publicados): 1 marcadamente
  //   abaixo · 2 abaixo · 3 dentro do esperado · 4 acima · 5 elevado · 6 muito elevado.
  //   Índice R: discriminação entre resposta coerente e resposta literal aos invertidos.
  //   Class_R_* ∈ {COERENTE, RESPOSTA LITERAL, INDETERMINADO, NÃO APLICÁVEL}.
  //   ⚠ z negativos, R = 0 e Omissões = 0 são resultados legítimos — guarda != null.
  //   ⚠ Formatar como texto simples todas as colunas com decimais (locale pt-PT).
  // ── PDRA-9 · Perfil Diferencial da Restrição Alimentar (v110.0) ──
  //   Ricardina Correia (2026). Instrumento ORIGINAL (Via B), inspirado na arquitetura
  //   tridimensional de rastreio da ARFID. NÃO é a NIAS nem tradução da NIAS.
  //   3 dimensões × 3 itens: S seletividade sensorial · A apetite/interesse ·
  //   R receio de consequências aversivas. Forma C escala 0–3, Forma P escala 0–5.
  //   Cotação em IE (0–100 %), comum às duas formas. Configuração é a saída primária.
  //   ⚠ SEM prorrateio · ⚠ Total calculado mas NÃO interpretado como gravidade.
  PDRA9_C: ['Data', 'Código', 'NomeCriança', 'Idade', 'Forma',
            'Informante', 'NomeInformante', 'Momento',
            'S_bruto', 'A_bruto', 'R_bruto',
            'S_IE', 'A_IE', 'R_IE',
            'S_Banda', 'A_Banda', 'R_Banda',
            'S_Saliente', 'A_Saliente', 'R_Saliente',
            'nSalientes', 'Delta', 'Configuração', 'Dominância', 'Total',
            'Validade', 'Omissões', 'ItensOmissos', 'Respostas'],

  PDRA9_P: ['Data', 'Código', 'NomeCriança', 'Idade', 'Forma',
            'Informante', 'NomeInformante', 'Momento',
            'S_bruto', 'A_bruto', 'R_bruto',
            'S_IE', 'A_IE', 'R_IE',
            'S_Banda', 'A_Banda', 'R_Banda',
            'S_Saliente', 'A_Saliente', 'R_Saliente',
            'nSalientes', 'Delta', 'Configuração', 'Dominância', 'Total',
            'Validade', 'Omissões', 'ItensOmissos', 'Respostas'],

  CAPS22: ['Data', 'Código', 'NomeCriança', 'Sexo', 'Idade',
           'Informante', 'NomeInformante', 'Administração',
           'SOP', 'SPP', 'Total',
           'SOP_z', 'SOP_T', 'SOP_Pct', 'SOP_Banda', 'SOP_Descritor',
           'SPP_z', 'SPP_T', 'SPP_Pct', 'SPP_Banda', 'SPP_Descritor',
           'SOP_z_Mista', 'SOP_Banda_Mista', 'SPP_z_Mista', 'SPP_Banda_Mista',
           'SOP_Prorrateado', 'SPP_Prorrateado', 'SOP_Prorrateado_4', 'SOP_SF', 'SPP_SF',
           'R_SOP', 'R_SPP', 'Class_R_SOP', 'Class_R_SPP',
           'Validade', 'Configuração', 'Omissões_SOP', 'Omissões_SPP', 'Respostas'],

  // ── CAPS-PR · Perfecionismo da criança — heterorrelato parental (v109.0) ──
  //   Bento Teixeira, Pereira & Macedo (2025), Psychologica, 68, e068004 (acesso aberto).
  //   9 itens, escala 1–5, sem itens invertidos, TOLERÂNCIA ZERO a omissões.
  //   SPP-PR = itens 1–5 (amplitude 5–25) · SOP-PR = itens 6–9 (amplitude 4–20).
  //   Correspondência item a item com a CAPS-22: PR1↔13, PR2↔15, PR3↔8, PR4↔21, PR5↔5,
  //   PR6↔1, PR7↔2, PR8↔7, PR9↔16 — permite comparar as fontes na métrica de resposta.
  //   ⚠ Referência provisória (subamostra de reteste, n = 64): NÃO é norma. As bandas
  //     NÃO são equiparáveis às do CAPS-criança.
  //   ⚠ O SPP-PR NÃO é indicador do SPP da criança — informa sobre o próprio informante.
  //     Só o SOP-PR é lido como observação do comportamento da criança.
  //   ⚠ Cada progenitor preenche um protocolo independente: o dedupe de 4 elementos
  //     garante que mãe e pai, no mesmo dia, geram 2 linhas distintas.
  CAPS_PR: ['Data', 'Código', 'NomeCriança', 'Sexo', 'Idade',
            'Informante', 'NomeInformante',
            'SPP_PR', 'SOP_PR', 'Total_PR',
            'SPP_PR_z', 'SPP_PR_Banda', 'SPP_PR_POMP',
            'SOP_PR_z', 'SOP_PR_Banda', 'SOP_PR_POMP',
            'TOT_PR_z', 'TOT_PR_Banda', 'TOT_PR_POMP', 'Respostas'],

  // ── QRF-C · Questionário de Relação Fraterna — versão criança (v107.0) ──
  //   Ricardina Correia (2026). Instrumento ORIGINAL (Via B), inspirado no modelo
  //   estrutural de Furman & Buhrmester (1985). NÃO é o SRQ nem tradução do SRQ.
  //   43 itens · autorrelato · 8–16 anos · uma aplicação = uma díade (um só irmão).
  //   17 escalas (E1..E17), todas MÉDIAS na métrica 1–5 — nunca somas.
  //   E1 Companheirismo · E2 Intimidade · E3 Afeto/prossocial · E4 Admiração dirigida
  //   E5 Cuidado prestado · E6 Cuidado recebido · E7 Dominância exercida ·
  //   E8 Dominância sofrida · E9 Discussão · E10 Antagonismo · E11 Competição ·
  //   E12/E13 Parcialidade Figura 1/2 · E14/E15 Legitimidade Figura 1/2 ·
  //   E16 Satisfação · E17 Importância.
  //   Índices direccionais com SINAL PRESERVADO: ESTATUTO (−4..+4, polo próprio
  //   positivo), DIR_F1/DIR_F2 (−2..+2, positivo = próprio percebido como favorecido)
  //   e ASSIM_INTERPAR (−4..+4). RIVALIDADE = MÁXIMO das magnitudes (0..2).
  //   Escala ou índice não cotável chega como 'n/c' — nunca como 0, nunca vazio.
  // ── QCF-P · Questionário de Comportamento Fraterno — versão parental (v108.0) ──
  //   Ricardina Correia (2026). Instrumento ORIGINAL (Via B), inspirado na estrutura
  //   de seis fatores do Sibling Inventory of Behavior. NÃO é o SIB nem tradução do SIB.
  //   HETERORRELATO: 1 linha = 1 PROGENITOR × toda a fratria (até 4 filhos).
  //   Seis dimensões de 4 itens cada, todas MÉDIAS na métrica de frequência 1–5:
  //   COMP Companheirismo (1–4) · EMP Empatia (5–8) · ENS Ensino/Tutoria (9–12) ·
  //   RIV Rivalidade (13–16) · AGR Agressão (17–20) · EVIT Evitamento (21–24).
  //   Bloco VII (25–27) — tratamento diferencial: DIRECAO_TD = média − 3, com SINAL
  //   PRESERVADO (−2..+2, positivo = este filho recebe mais do que os irmãos);
  //   MAGNITUDE_TD = |DIRECAO_TD|. Bloco VIII (28–29) — perceção e legitimidade
  //   estimadas pelo progenitor.
  //   Índices de fratria (uma vez por protocolo, não por filho): IndiceSimetria =
  //   média das 6 amplitudes máx−mín entre colunas interpretáveis; DesvioEspelho só
  //   com exactamente 2 filhos; PerfilFratria descreve onde o diferencial se concentra.
  //   ⚠ '—' = coluna inativa (filho não identificado) · 'n/c' = coluna activa mas
  //   dimensão não cotável. São estados diferentes e ambos são gravados tal e qual.
  QCFP: ['Data', 'Código', 'NomeCriança',
         'Informante', 'NomeInformante', 'ResideCom',
         'Emparelhamento', 'RelacaoReferencia', 'IrmaoReferencia', 'Momento',
         'NFilhos', 'Filhos',
         'ValidadeProtocolo', 'ColunasAtivas', 'ColunasInterpretaveis',
         'IndiceSimetria', 'DimensaoMaiorAmplitude', 'DesvioEspelho', 'PerfilFratria',
         'F1_Nome', 'F1_Validade', 'F1_COMP', 'F1_EMP', 'F1_ENS', 'F1_RIV', 'F1_AGR',
         'F1_EVIT', 'F1_DIRECAO_TD', 'F1_MAGNITUDE_TD', 'F1_PERCECAO', 'F1_LEGITIMIDADE',
         'F2_Nome', 'F2_Validade', 'F2_COMP', 'F2_EMP', 'F2_ENS', 'F2_RIV', 'F2_AGR',
         'F2_EVIT', 'F2_DIRECAO_TD', 'F2_MAGNITUDE_TD', 'F2_PERCECAO', 'F2_LEGITIMIDADE',
         'F3_Nome', 'F3_Validade', 'F3_COMP', 'F3_EMP', 'F3_ENS', 'F3_RIV', 'F3_AGR',
         'F3_EVIT', 'F3_DIRECAO_TD', 'F3_MAGNITUDE_TD', 'F3_PERCECAO', 'F3_LEGITIMIDADE',
         'F4_Nome', 'F4_Validade', 'F4_COMP', 'F4_EMP', 'F4_ENS', 'F4_RIV', 'F4_AGR',
         'F4_EVIT', 'F4_DIRECAO_TD', 'F4_MAGNITUDE_TD', 'F4_PERCECAO', 'F4_LEGITIMIDADE',
         'Respostas'],

  QRFC: ['Data', 'Código', 'NomeCriança', 'Idade', 'NomeIrmão', 'IdadeIrmão',
         'CodigoDiade', 'Figura1', 'Figura2', 'Momento',
         'Informante', 'NomeInformante',
         'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9',
         'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17',
         'CALOR', 'CONFLITO', 'POLO_PROPRIO', 'POLO_IRMAO', 'ESTATUTO', 'INTENSIDADE',
         'DIR_F1', 'MAG_F1', 'DIR_F2', 'MAG_F2',
         'RIVALIDADE', 'RIV_MEDIA', 'CONFIG_PARC', 'ASSIM_INTERPAR',
         'LEGIT_F1', 'LEGIT_F2', 'SATISFACAO', 'IMPORTANCIA',
         'DP_A', 'MEDIA_A', 'PCT_MEDIO', 'SINALIZACAO', 'ITENS_RESP', 'VALIDADE',
         'Respostas'],

  // ── CBQ-SF · Children's Behavior Questionnaire — Forma Breve (v106.0) ──
  //   Putnam & Rothbart (2006) · trad. PT Franklin, Soares, Sampaio, Santos & Veríssimo (2003).
  //   94 itens, Likert 1–7 com opção NA. 15 escalas (M_*) e 7 dimensões (D_*), todas na
  //   métrica 1–7 — são MÉDIAS, não somas, e podem ter casas decimais.
  //   Escalas: NA nível de atividade · IF irritação/frustração · AE aproximação/entusiasmo ·
  //   FA foco atencional · DE desconforto · SLR sensibilidade/limiar de resposta · ME medo ·
  //   EIP elevada intensidade de prazer · IM impulsividade · CI controlo inibido ·
  //   BIP baixa intensidade de prazer · SP sensibilidade percetiva · TR tristeza ·
  //   TI timidez · SG sorrisos/gargalhadas.
  //   Dimensões: MA_* Modelo A canónico (Rothbart et al., 2001), MA_EXT4 variante restrita
  //   de Extroversão (Putnam & Rothbart, 2006), MB_* Modelo B empírico português (Lopes, 2011).
  //   Escala não cotada (omissos acima do limite) chega como '' — nunca como 0.
  CBQ_SF: ['Data', 'Código', 'NomeCriança', 'DataNasc', 'Sexo', 'Idade',
          'Informante', 'NomeInformante',
          'ValidadeProtocolo', 'PctOmissos', 'NEscalasValidas', 'DP_Respostas',
          'Invariancia', 'PadraoResposta',
          'M_NA', 'M_IF', 'M_AE', 'M_FA', 'M_DE', 'M_SLR', 'M_ME', 'M_EIP',
          'M_IM', 'M_CI', 'M_BIP', 'M_SP', 'M_TR', 'M_TI', 'M_SG',
          'D_MA_EXT', 'D_MA_AN', 'D_MA_CE', 'D_MA_EXT4',
          'D_MB_EXT', 'D_MB_AN', 'D_MB_CE',
          'EscalasInvalidas', 'Respostas'],

  // ── QCVE-P · Comportamento Verbal em Contexto Escolar — Professor (v105.0) ──
  //   Ricardina Correia (2026). Instrumento ORIGINAL (Via B), inspirado no modelo
  //   estrutural do School Speech Questionnaire. NÃO é o SMQ nem permutável com ele.
  //   20 itens: 1–12 = ECV (E1 pares 1–4 · E2 adultos 5–8 · E3 exposição 9–12),
  //   13–16 = ICNV (comunicação não verbal), 17–20 = IIF (interferência funcional).
  //   ⚠ ESCALA INVERSA na ECV: 0,00 = ausência total de fala = gravidade MÁXIMA.
  //   ⚠ ICNV e IIF são índices AUTÓNOMOS — nunca somados ao Total ECV.
  //   «SO» (sem oportunidade de observar) é excluído do numerador E do denominador.
  //   Validade: >= 3 de 4 itens por subescala; com exactamente 3 marca estimativa
  //   exploratória; com <= 2 a subescala é INVÁLIDA e nunca cotada a zero.
  //   Sem normas portuguesas — bandas exploratórias, ancoragem analógica no SSQ.
  //   ⚠ FORMATAR NO SHEET COMO TEXTO SIMPLES: E1_Media, E2_Media, E3_Media,
  //     ECV_Total, IRV, ICNV_Media, IIF_Media (a locale pt-PT converte "2,20" em data).
  QCVEP_PROF: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Idade', 'AnoEscolaridade', 'Escola',
    'Informante', 'NomeInformante', 'MomentoAvaliacao',
    'TemposSemana', 'MesesConhece', 'DuracaoMeses', 'ModoInicio',
    'LinguaMaterna', 'LinguaEscolaridade', 'AmbasLinguas', 'AlteracaoContexto',
    'AcontecimentoAdverso', 'FalaCom', 'NaoFalaCom', 'Observacoes',
    'E1_Media', 'E1_Estatuto', 'E2_Media', 'E2_Estatuto', 'E3_Media', 'E3_Estatuto',
    'ECV_Total', 'ECV_Estatuto', 'IRV', 'SomaBruta', 'SO_Total',
    'ICNV_Media', 'ICNV_Estatuto', 'IIF_Media', 'IIF_Estatuto',
    'Banda_ECV', 'Banda_ICNV', 'Banda_IIF',
    'Configuracao', 'Gradiente', 'Discrepancia', 'Integridade', 'Respostas'
  ],

  // ── SMQ · Selective Mutism Questionnaire — Versão Pais (v104.0) ──
  //   Bergman, Keller, Piacentini & Bergman (2008). 23 itens.
  //   Itens 1–17 = frequência de fala (0 Nunca · 1 Raramente · 2 Frequentemente · 3 Sempre)
  //   organizados em 3 subescalas: Escola 1–6 · Casa/Família 7–12 · Social 13–17.
  //   Itens 18–23 = interferência/desconforto (0 Nada → 3 Muito) — escala AUTÓNOMA,
  //   NÃO integra a pontuação de sintomas.
  //   Métrica primária: média por escala (0–3). Secundária: soma prorrateada (média × N nominal).
  //   ⚠ ESCALA INVERSA — pontuações mais BAIXAS indicam MENOS fala e MAIS gravidade.
  //   Rastreio sobre a soma de sintomas (0–51): <= 14 especificidade máxima · <= 38 positivo · > 38 negativo.
  //   (O corte de 13 citado na literatura secundária refere-se à cotação INVERTIDA e não se aplica.)
  SMQ_Pais: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'NomeInformante', 'Relação',
    'Media_Escola', 'Estado_Escola', 'Media_Casa', 'Estado_Casa',
    'Media_Social', 'Estado_Social', 'Media_Total', 'Estado_Total',
    'Soma_Sintomas', 'Rastreio',
    'Media_Interf_Crianca', 'Media_Desc_Crianca', 'Media_Desc_Cuidador',
    'Media_Interf_Global', 'Soma_Interferencia',
    'IDC', 'Disc_Social_Escola', 'NA_Itens', 'Omissos', 'Respostas'
  ],

  // ── SMQ · Selective Mutism Questionnaire — Versão Professores (v104.0) ──
  //   11 itens: 1–6 frequência de fala em contexto escolar (mesma métrica da versão pais);
  //   a–c interferência funcional · d desconforto do aluno · e desconforto do professor.
  //   Sem métrica de rastreio própria: o corte <= 38/51 aplica-se apenas à versão parental
  //   de 17 itens. Esta versão difere do School Speech Questionnaire publicado — os
  //   resultados das duas NÃO são permutáveis.
  SMQ_Prof: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'Ano', 'NomeInformante', 'Relação',
    'Media_Escola_Prof', 'Estado_Escola_Prof', 'Soma_Escola_Prof', 'Banda_Escola_Prof',
    'Media_Interf_Prof', 'Estado_Interf_Prof',
    'Media_Desc_Aluno', 'Media_Desc_Prof', 'Omissos', 'Respostas'
  ],

  // ── GAD-7 · Escala de Ansiedade Generalizada (v93.0) ──
  //   Spitzer, Kroenke, Williams & Löwe (2006). Autorrelato, 7 itens, 0–3, últimos 14 dias.
  //   Unidimensional: total 0–21, sem subescalas e sem itens invertidos.
  //   Ponto de corte de rastreio >= 10. Bandas descritivas 0–4 · 5–9 · 10–14 · 15–21.
  GAD7: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'Sexo', 'Informante', 'NomeInformante',
    'Momento', 'Contexto',
    'N_Respondidos', 'Soma', 'Total', 'Prorratado', 'Validade', 'Banda', 'Rastreio',
    'Pct_Max', 'Itens_GE2', 'Max_Item', 'Item_Mais_Elevado', 'Respostas'
  ],

  // ── AIS-8 · Escala de Insónia de Atenas (v92.0) ──
  //   Soldatos, Dikeos & Paparrigopoulos (2000, 2003). Autorrelato, 8 itens, 0–3, último mês.
  //   Itens 1–5 = índice noturno (AIS-5, 0–15) · itens 6–8 = índice diurno (0–9) · Total 0–24.
  //   Todos os itens directos: sem inversões nem ponderações. Ponto de corte total >= 6.
  AIS_8: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante',
    'Idade', 'Sexo', 'Momento',
    'Total', 'Noturno', 'Diurno', 'Banda', 'Rastreio',
    'ItensMaiorIgual2', 'ItensIgual3', 'Respostas'
  ],

  // ── ESS · Escala de Sonolência de Epworth (v117.0) ──
  //   Johns (1991); versão portuguesa CEISUC/LEPS (2001). Autorrelato de ADULTO,
  //   8 itens, 0–3, todos directos. Total 0–24 = soma simples. Sem normas PT.
  //   'NomeUtente' e não 'NomeCriança': o respondente responde sobre si próprio.
  //   Total/Max_Item/G1_Media/G2_Media/Dif_G2_G1 ficam VAZIAS se o protocolo for
  //   inválido (R5) — vazio significa não interpretável, nunca zero.
  ESS_Epworth: [
    'Data', 'Código', 'NomeUtente', 'NomeInformante', 'Informante',
    'Idade', 'Sexo', 'Contexto', 'Item8Aplicavel',
    'N_Respondidos', 'Soma', 'Total', 'Natureza', 'Validade',
    'Sistema_A', 'Criterio_PT', 'Sistema_C', 'Concordancia',
    'G1_Soma', 'G1_Media', 'G2_Soma', 'G2_Media', 'Dif_G2_G1',
    'Max_Item', 'N_Item_3', 'N_Item_2mais', 'N_Item_0', 'Veiculo_4_8',
    'Flag_Item3', 'Flag_G2', 'Flag_Veiculo', 'Flag_Idade',
    'Comparabilidade', 'Respostas'
  ],

  // ── STOP-BANG · Rastreio de risco de SAOS (v118.0) ──
  //   Chung et al. (2008); critérios da versão portuguesa de Reis et al. (2015).
  //   Instrumento PROPRIETÁRIO (UHN, Toronto) — Via A-restrita: designações de
  //   domínio e critérios operacionais objetivos, NUNCA os enunciados dos itens.
  //   Ficha de cotação de uso clínico (preenche o profissional), ADULTO (≥ 18 anos).
  //   Índice FORMATIVO de 8 indicadores binários, total 0–8. Sem subescalas: STOP
  //   (itens 1–4, sintomáticos) e BANG (itens 5–8, objetivos) são blocos de contagem.
  //   'NomeUtente' e não 'NomeCriança': o protocolo descreve a pessoa avaliada.
  //   Cot_N_PT (> 40 cm) é a cotação principal; Cot_N_UHN (M ≥ 43 / F ≥ 41) é a
  //   verificação de concordância. Divergência assinalada, nunca resolvida.
  //   ⚠ Guarda != null obrigatória em TODAS as colunas numéricas: 0 é resultado
  //     válido em cada cotação, em cada subtotal e nos totais (0 → «Risco baixo»).
  //   ⚠ Altura e IMC têm vírgula decimal — formatar como TEXTO SIMPLES no Sheet.
  STOPBANG: [
    'Data', 'Código', 'NomeUtente', 'NomeInformante', 'Informante',
    'Idade', 'Sexo', 'Peso', 'Altura', 'PerimetroCervical', 'IMC',
    'Ressonar', 'Cansaco', 'ApneiasObservadas', 'Hipertensao',
    'Cot_S', 'Cot_T', 'Cot_O', 'Cot_P', 'Cot_B', 'Cot_A',
    'Cot_N_PT', 'Cot_N_UHN', 'Cot_G',
    'SubtotalSTOP', 'SubtotalBANG', 'TotalPT', 'TotalUHN',
    'BandaDocumentoFonte', 'ClassificacaoFinal', 'ClassificacaoUHN', 'Concordancia',
    'ProbabilidadeSAOS', 'ProbabilidadeSAOSGrave', 'Elegibilidade', 'Respostas'
  ],

  // ── ACE-Q · Experiências Adversas na Infância (v87.0) ──
  //   Autorrelato (adolescente, 18 itens) + Cuidador (15 itens). Mesma estrutura de colunas.
  ACE_Q_ADOLESCENTE: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Relação',
    'Total', 'Classificação',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'Respostas'
  ],
  ACE_Q_CUIDADOR: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Relação',
    'Total', 'Classificação',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'Respostas'
  ],

  TAS20: [
    'Data', 'Código', 'Nome', 'Total', 'DIF', 'DDF', 'EOT',
    'Classificação', 'Respostas'
  ],

  CBCL_618: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'Sexo', 'GrupoIdade', 'PreenchidoPor',
    'T_INT', 'T_EXT', 'T_TOT',
    'T_I', 'T_II', 'T_III', 'T_IV', 'T_V', 'T_VI', 'T_VII', 'T_VIII',
    'RawTotal', 'Respostas',
    // v95 — brutos por escala. NO FIM de propósito: inserir antes de 'Respostas'
    // desalinharia as linhas históricas. RawTotal já existia na posição 18.
    'Raw_INT', 'Raw_EXT',
    'Raw_I', 'Raw_II', 'Raw_III', 'Raw_IV', 'Raw_V', 'Raw_VI', 'Raw_VII', 'Raw_VIII'
  ],

  TRF_618: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'Sexo', 'GrupoIdade', 'PreenchidoPor',
    'T_INT', 'T_EXT', 'T_TOT',
    'T_I', 'T_II', 'T_III', 'T_IV', 'T_V', 'T_VI', 'T_VII', 'T_VIII',
    'Preocupacao', 'Pontos_Fortes', 'Respostas',
    // v96 — brutos. NO FIM de propósito: inserir antes desalinharia as linhas históricas.
    'Raw_INT', 'Raw_EXT', 'Raw_TOT',
    'Raw_I', 'Raw_II', 'Raw_III', 'Raw_IV', 'Raw_V', 'Raw_VI', 'Raw_VII', 'Raw_VIII',
    'Raw_Desatencao', 'Raw_HiperImp'
  ],

  YSR_1118: [
    'Data', 'Código', 'Nome', 'Idade', 'Sexo', 'GrupoIdade',
    'T_INT', 'T_EXT', 'T_TOT',
    'T_I', 'T_II', 'T_III', 'T_IV', 'T_V', 'T_VI', 'T_VII', 'T_VIII',
    'Respostas',
    // v94 — brutos. Acrescentados NO FIM de propósito: inserir antes de 'Respostas'
    // desalinharia todas as linhas históricas da aba.
    'Raw_INT', 'Raw_EXT', 'Raw_TOT',
    'Raw_I', 'Raw_II', 'Raw_III', 'Raw_IV', 'Raw_V', 'Raw_VI', 'Raw_VII', 'Raw_VIII',
    'Raw_Outros'
  ],

  CBCL_15: [
    'Data', 'Código', 'Nome', 'Sexo', 'Informante', 'NomeInformante',
    'T_Reatividade', 'T_Ansiedade', 'T_Somaticas', 'T_Retraimento',
    'T_Sono', 'T_Atencao', 'T_Agressivo',
    'T_Internalizante', 'T_Externalizante', 'T_Total',
    'Respostas'
  ],

  CTRF_15: [
    'Data', 'Código Paciente', 'Nome Criança', 'Sexo', 'Data Nasc', 'Idade',
    'Informante', 'Habilitações', 'Exp Anos', 'Papel',
    'Tempo Conhece (meses)', 'Nome Inst', 'Tipo Inst', 'N Crianças',
    'Horas Semana', 'Grau Conhecimento', 'Trat Especial', 'Doença',
    'Preocupação', 'Melhor', 'Prof Pai', 'Prof Mãe',
    'Score Total', 'Respostas', 'Item 100'
  ],

  LDS: [
    'Data', 'Código', 'Idade (meses)', 'Sexo',
    'Prematuro', 'Semanas Prem', 'Peso Nasc',
    'Otite', 'Bilingue', 'Línguas',
    'Hist Familiar', 'Relação Hist Fam',
    'Preocupação', 'Motivo Preocupação',
    'Diz Palavras', 'Combina Frases',
    'Frases Exemplo', 'MLU', 'Vocab Score', 'Palavras'
  ],

  SWAN: [
    'Data', 'Código', 'Nome Criança', 'Informante', 'Relação',
    'Score Desatenção', 'Score Hiperatividade', 'Score Total',
    'Classificação', 'Respostas'
  ],

  SRS2_IE_Pais: [
    'Data', 'Código', 'Respondente', 'Sexo', 'Idade',
    'PERC_raw', 'PERC_T', 'PERC_pct',
    'COG_raw',  'COG_T',  'COG_pct',
    'COM_raw',  'COM_T',  'COM_pct',
    'MOT_raw',  'MOT_T',  'MOT_pct',
    'PRR_raw',  'PRR_T',  'PRR_pct',
    'CIS_raw',  'CIS_T',  'CIS_pct',
    'TOT_raw',  'TOT_T',  'TOT_pct',
    'Classificação', 'Respostas'
  ],

  SRS2_IE_Prof: [
    'Data', 'Código', 'Respondente', 'Sexo', 'Idade',
    'PERC_raw', 'PERC_T', 'PERC_pct',
    'COG_raw',  'COG_T',  'COG_pct',
    'COM_raw',  'COM_T',  'COM_pct',
    'MOT_raw',  'MOT_T',  'MOT_pct',
    'PRR_raw',  'PRR_T',  'PRR_pct',
    'CIS_raw',  'CIS_T',  'CIS_pct',
    'TOT_raw',  'TOT_T',  'TOT_pct',
    'Classificação', 'Respostas'
  ],


  // ── RAADS-R — v37.0 ─────────────────────────────────────────
  RAADSR: [
    'Data', 'Codigo', 'PreenchidoPor', 'Idade', 'Genero',
    'Total', 'Social', 'Linguagem', 'Sensoriomotora', 'Circunscrita',
    'Interpretacao', 'Respostas'
  ],

  // ── AQ-50 — v38.0 ───────────────────────────────────────────
  AQ50: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante',
    'Total', 'Social', 'Atencao', 'Rotinas', 'Imaginacao',
    'Zona', 'Respostas'
  ],

  // ── BAS-3 — Bateria de Socialização (Auto-avaliação) — v40.0 ──
  BAS3: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Idade', 'Sexo', 'Ano', 'Grupo',
    'Co', 'Ac', 'Is', 'At', 'Li', 'S',
    'Co_PC', 'Ac_PC', 'Is_PC', 'At_PC', 'Li_PC', 'S_PC',
    'Respostas'
  ],

  // ── QACSE-R — Avaliação de Competências Socioemocionais (versão reduzida) v51.0 ──
  // Coelho & Sousa, 2020 · 32 itens · 4 escalas · 10–16 anos · auto-relato.
  // Likert 1–4. AC e CR são competências (alto = positivo); IS e AS são
  // dificuldades (alto = preocupante). Cut-offs heurísticos por terços.
  QACSE_R: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Idade', 'Sexo', 'Ano', 'Avaliador',
    'AC', 'CR', 'IS', 'AS',
    'AC_cat', 'CR_cat', 'IS_cat', 'AS_cat',
    'Respostas'
  ],

  // ── QACSE-C — Competências Socioemocionais (Complementar à BAS-3) v51.0 ──
  // Coelho & Sousa, 2016 · 40 itens · 5 escalas CASEL · 10–17 anos · auto-relato.
  // Todas as escalas são competências (alto = positivo); cut-offs heurísticos
  // únicos por terços (8-16 / 17-24 / 25-32). Instrumento complementar à BAS-3
  // — cobre dimensões CASEL ausentes da BAS-3 (consultar grelha integrativa).
  QACSE_C: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Idade', 'Sexo', 'Ano', 'Avaliador',
    'ACE', 'RE', 'TP', 'RAC', 'TDR',
    'ACE_cat', 'RE_cat', 'TP_cat', 'RAC_cat', 'TDR_cat',
    'Respostas'
  ],

  // ── PPGR-J — v41.0 ──────────────────────────────────────────
  PPGRJ: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Idade',
    'Clube', 'Escalao', 'Posição', 'NomeRespondente',
    'AAC', 'AAC_cls', 'MEF', 'MEF_cls', 'PFE', 'PFE_cls',
    'APP', 'APP_cls', 'EEIP', 'EEIP_cls', 'RPRM', 'RPRM_cls',
    'TOTAL', 'TOTAL_cls', 'NORM', 'DIM_PRED', 'ALERTAS',
    'Respostas'
  ],

  // ── CCBQ — v42.0 ────────────────────────────────────────────
  CCBQ: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Idade', 'Sexo', 'Situacao',
    'F1_Bruto', 'F1_Media', 'F1_Banda',
    'F2_Bruto', 'F2_Media', 'F2_Banda',
    'F3_Bruto', 'F3_Media', 'F3_Banda',
    'Total_Bruto', 'Total_Media', 'Perfil',
    'Respostas'
  ],

  // ── KIDCOPE — Crianças (7-12) — v43.0 ────────────────────────
  KIDCOPE_CR: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'NomeInformante',
    'Versão', 'Situacao',
    'A_pctUso', 'A_pctEf', 'A_indice', 'A_banda',
    'E_pctUso', 'E_pctEf', 'E_indice', 'E_banda',
    'D_pctUso', 'D_pctEf', 'D_indice', 'D_banda',
    'Perfil_Chave', 'Perfil_Nome', 'Respostas'
  ],

  // ── KIDCOPE — Adolescentes (13-18) — v43.0 ───────────────────
  KIDCOPE_AD: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'NomeInformante',
    'Versão', 'Situacao',
    'A_pctUso', 'A_pctEf', 'A_indice', 'A_banda',
    'E_pctUso', 'E_pctEf', 'E_indice', 'E_banda',
    'D_pctUso', 'D_pctEf', 'D_indice', 'D_banda',
    'A_discrep', 'A_flag', 'E_discrep', 'E_flag', 'D_discrep', 'D_flag',
    'Perfil_Chave', 'Perfil_Nome', 'Respostas'
  ],

  // ── ANAMNESE — História Prévia — v44.0 ──────────────────────
  // Ricardina Correia (2026) · instrumento qualitativo, sem cotação
  // Respostas completas serializadas em JSON numa única coluna
  ANAMNESE_HP: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Relação', 'Respostas'
  ],

  // ── ISC-24 — Inventário de Somatização para Crianças — v45.0 ────────────
  // Ferreira, Martins, Monteiro & Pereira (2014) · adaptação PT do CSI-24
  // (Walker et al., 2009) · 8–18 anos · 24 itens Likert 0-4
  // Pontuação Total (0-96) + z-score vs norma idade×género + 7 clusters
  ISC24: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente', 'Relação',
    'Idade', 'Género', 'Ano',
    'PT', 'Media_Item', 'N_Sintomas', 'N_Intensos',
    'Z_Score', 'Percentil', 'Classificacao', 'Grupo_Norma',
    'C1_Soma', 'C1_Media',
    'C2_Soma', 'C2_Media',
    'C3_Soma', 'C3_Media',
    'C4_Soma', 'C4_Media',
    'C5_Soma', 'C5_Media',
    'C6_Soma', 'C6_Media',
    'C7_Soma', 'C7_Media',
    'Respostas'
  ],

  // ── QEA — Questionário de Esquemas para Adolescentes — v46.0 ────────────
  // Santos, Rijo & Pinto-Gouveia (2009) · 54 itens · 18 esquemas · 3 domínios 2.ª ordem
  // 10-25 anos · auto-relato · ponto de corte clínico: média ≥ 3,5
  QEA: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'Sexo', 'AnoEscolaridade',
    'TotalQEA', 'MediaGlobal', 'NPrevalentes', 'EsquemaDominante',
    'IS_Total', 'IS_Media', 'EMA_Total', 'EMA_Media',
    'PER_Total', 'PER_Media', 'PE_Total', 'PE_Media',
    'AB_Total', 'AB_Media', 'AP_Total', 'AP_Media',
    'AS_Total', 'AS_Media', 'VUL_Total', 'VUL_Media',
    'DA_Total', 'DA_Media', 'IEMOC_Total', 'IEMOC_Media',
    'SUB_Total', 'SUB_Media', 'GR_Total', 'GR_Media',
    'FR_Total', 'FR_Media', 'DEP_Total', 'DEP_Media',
    'DF_Total', 'DF_Media', 'REC_Total', 'REC_Media',
    'AI_Total', 'AI_Media', 'PESS_Total', 'PESS_Media',
    'MVD_Media', 'LEV_Media', 'AE_Media', 'Respostas'
  ],

  // ── EMP-H&F — Escala Multidimensional de Perfeccionismo — v47.0 ─────────
  // Hewitt & Flett (1991) · versão reduzida 32 itens · Likert 1-7 · auto-relato
  // 3 subescalas: PAO (Auto-Orientado) · PSP (Socialmente Prescrito) · POO (Orientado p/ Outros)
  // + Total · inversões aplicadas no HTML antes do envio
  EMP_HF: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Idade', 'Sexo',
    'PAO_raw', 'PSP_raw', 'POO_raw', 'TOTAL_raw',
    'PAO_media', 'PSP_media', 'POO_media', 'TOTAL_media',
    'Respostas'
  ],

  // ── EMP-F — Escala Multidimensional de Perfeccionismo (Frost) — v47.0 ───
  // Frost et al. (1990) · versão reduzida 24 itens · Likert 1-5 · SEM inversões
  // 6 subescalas × 4 itens: CM (Preocupações c/ Erros) · DA (Dúvidas Ações)
  // · PE (Expectativas Parentais) · PC (Críticas Parentais)
  // · PS (Padrões Pessoais) · O (Organização)
  // Cut-offs ESPECÍFICOS por subescala; SEM total global
  EMP_F: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Idade', 'Sexo',
    'CM_raw', 'DA_raw', 'PE_raw', 'PC_raw', 'PS_raw', 'O_raw',
    'CM_media', 'DA_media', 'PE_media', 'PC_media', 'PS_media', 'O_media',
    'Respostas'
  ],

  // ── OCI-CV-R — Inventário Obsessivo-Compulsivo Revisto para Crianças — v48.0 ──
  // Abramovitch, Abramowitz, McKay, Cham, Anderson et al. (2022)
  // J Anxiety Disord 86:102532 · 18 itens · 7-17 anos · auto-relato
  // Likert 0-2 (Nunca/Às vezes/Sempre) · janela: último mês
  // 5 subescalas: VD (Verificação/Dúvida, max 10) · OBS (Obsessões, max 8) ·
  //              LAV (Lavagem, max 6) · ORD (Ordenação, max 6) · NEUTR (max 6)
  // Total 0-36 · Faixas: 0-5 Ausência · 6-7 Limiar · 8-13 Provável POC ·
  //                      14-21 OC marcada · 22-36 OC severa
  OCI_CV_R: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'Sexo', 'GrupoIdade',
    'Total', 'VD_Raw', 'OBS_Raw', 'LAV_Raw', 'ORD_Raw', 'NEUTR_Raw',
    'Categoria', 'Respostas'
  ],

  // ── OCI-R — Inventário Obsessivo-Compulsivo Revisto (adultos) — v49.0 ──
  // Foa, Huppert, Leiberg, Hajcak, Langner, Kichic & Salkovskis (2002)
  // Versão portuguesa: Cardoso (2015), Universidade Lusófona — 6 fatores correlacionados confirmados
  // Psychol Assessment 14(4):485-496 · 18 itens · ≥18 anos · auto-relato
  // Likert 0-4 (De maneira alguma/Um pouco/Moderadamente/Muito/Extremamente) · janela: último mês
  // 6 subescalas (3 itens × 0-12 cada):
  //   Lavagem (7,13,18 · corte ≥5) · Verificação (8,10,15 · ≥6) · Ordem (1,11,16 · ≥7)
  //   Acumulação (2,5,14 · ≥5) · Obsessões (3,4,9 · ≥5) · Neutralização (6,12,17 · ≥3)
  // Total 0-72 · Corte global ≥21 sugere provável POC (sens. 65,6% / spec. 63,9%)
  // Faixas: 0-13 Ausência/Baixa · 14-20 Ligeira · 21-31 Moderada (provável POC) ·
  //         32-47 Marcada · 48-72 Severa
  OCI_R: [
    'Data', 'Código', 'NomePaciente',
    'Idade', 'Sexo', 'DataAplicacao',
    'Total', 'Lavagem_Raw', 'Verificacao_Raw', 'Ordem_Raw',
    'Acumulacao_Raw', 'Obsessoes_Raw', 'Neutralizacao_Raw',
    'Categoria', 'Respostas'
  ],

  ABAS3_05: [
    'Data', 'Código', 'Nome', 'Sexo', 'Idade', 'Informante',
    'CAG', 'CC', 'SC', 'PC',
    'COM_SB', 'COM_SS', 'CU_SB',  'CU_SS',
    'HL_SB',  'HL_SS',  'HS_SB',  'HS_SS',
    'LE_SB',  'LE_SS',  'SD_SB',  'SD_SS',
    'SO_SB',  'SO_SS',  'Respostas'
  ],

  ABAS3_05P: [
    'Data', 'Código', 'Nome', 'Sexo', 'Idade', 'Informante',
    'CAG', 'CC', 'SC', 'PC',
    'COM_SB', 'COM_SS', 'CU_SB',  'CU_SS',
    'HL_SB',  'HL_SS',  'HS_SB',  'HS_SS',
    'LE_SB',  'LE_SS',  'SD_SB',  'SD_SS',
    'SO_SB',  'SO_SS',  'Respostas'
  ],

  ABAS3_PAIS: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Parentesco', 'IdadeCriança',
    'CAG', 'CC', 'SC', 'PC',
    'COM_SB', 'COM_SS', 'CU_SB',  'CU_SS',
    'FA_SB',  'FA_SS',  'HL_SB',  'HL_SS',
    'HS_SB',  'HS_SS',  'LE_SB',  'LE_SS',
    'SD_SB',  'SD_SS',  'SO_SB',  'SO_SS',
    'WK_SB',  'WK_SS',  'Respostas'
  ],

  ABAS3_PROF: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'NívelEscolar', 'TempoConhece',
    'CAG', 'CC', 'SC', 'PC',
    'COM_SB', 'COM_SS', 'CU_SB',  'CU_SS',
    'FA_SB',  'FA_SS',  'HL_SB',  'HL_SS',
    'HS_SB',  'HS_SS',  'LE_SB',  'LE_SS',
    'SD_SB',  'SD_SS',  'SO_SB',  'SO_SS',
    'WK_SB',  'WK_SS',  'Respostas'
  ],

  ABAS3_ADULT: [
    'Data', 'Código', 'NomePróprio', 'TipoRespondente', 'Idade', 'SituaçãoLaboral',
    'GAC', 'CC', 'SC', 'PC',
    'COM_SB', 'COM_SS', 'FA_SB',  'FA_SS',
    'SD_SB',  'SD_SS',  'LE_SB',  'LE_SS',
    'SO_SB',  'SO_SS',  'CU_SB',  'CU_SS',
    'HL_SB',  'HL_SS',  'HS_SB',  'HS_SS',
    'SC_SB',  'SC_SS',  'WK_SB',  'WK_SS',
    'Respostas'
  ],

  BRIEF_Professores: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Género', 'Ano', 'Professor', 'Disciplina',
    'INI', 'MUD', 'CE', 'INC', 'MT', 'PO', 'OM', 'MON',
    'IRC', 'IM', 'GEF', 'Respostas'
  ],

  BRIEF_Pais: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Género', 'Ano', 'NomeRespondente', 'Relação',
    'INI', 'MUD', 'CE', 'INC', 'MT', 'PO', 'OM', 'MON',
    'IRC', 'IM', 'GEF', 'Respostas'
  ],

  BRIEF_PreEscolar_Pais: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Género', 'Escola',
    'NomeInformante', 'Relação',
    'INHIB_raw', 'SHIFT_raw', 'ECON_raw', 'WM_raw', 'PO_raw',
    'ISCI_raw',  'FI_raw',   'EMI_raw',  'GEC_raw',
    'INHIB_T',   'SHIFT_T',  'ECON_T',   'WM_T',   'PO_T',
    'ISCI_T',    'FI_T',     'EMI_T',    'GEC_T',
    'Inconsistência', 'Negatividade', 'Respostas'
  ],

  BRIEF_PreEscolar_Professores: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'DataNasc', 'Género', 'Escola',
    'INHIB_raw', 'SHIFT_raw', 'ECON_raw', 'WM_raw', 'PO_raw',
    'ISCI_raw',  'FI_raw',   'EMI_raw',  'GEC_raw',
    'INHIB_T',   'SHIFT_T',  'ECON_T',   'WM_T',   'PO_T',
    'ISCI_T',    'FI_T',     'EMI_T',    'GEC_T',
    'Inconsistência', 'Negatividade', 'Respostas'
  ],

  BRIEF_Autoavaliacao: [
    'Data', 'Código', 'Nome', 'DataNasc', 'Idade', 'GrupoIdade', 'Género', 'AnoEscolar',
    'Raw_Inib', 'Raw_Shift', 'Raw_EC',  'Raw_Mon',
    'Raw_WM',   'Raw_PO',   'Raw_OM',  'Raw_TC',
    'Raw_IRC',  'Raw_IM',   'Raw_GEF',
    'T_Inib',   'T_Shift',  'T_EC',    'T_Mon',
    'T_WM',     'T_PO',     'T_OM',    'T_TC',
    'T_IRC',    'T_IM',     'T_GEF',
    'Inconsistência', 'Negatividade', 'Respostas'
  ],

  // ── BRIEF-A · Behavior Rating Inventory of Executive Function, Adult Version (v116.0) ──
  // Duas abas com o MESMO cabeçalho (25 colunas), na ordem exacta em que o doPost as
  // envia — validada por posição contra buildRow.
  // Só pontuações BRUTAS: as colunas de T-score e percentil não existem por decisão
  // clínica. A conversão normativa (por idade e sexo) é feita manualmente a partir das
  // tabelas do manual. 'Idade' e 'Género' são gravados precisamente porque são o que a
  // conversão manual exige.
  // Os itens 10, 27, 38, 48 e 59 pertencem à escala de Infrequência e NÃO entram em
  // nenhuma escala clínica: 70 itens clínicos + 5 de validade = 75.
  BRIEF_A_AUTO: [
    'Data', 'Código', 'NomeAvaliado', 'DataNasc', 'Idade', 'Género', 'Escolaridade',
    'NomeInformante', 'Relação',
    'INIB', 'FLEX', 'CE', 'AUTOM', 'BRI',
    'INIC', 'MT', 'PO', 'MTAR', 'OM', 'MI',
    'GEC', 'INFREQ', 'INCONS', 'NRespondidos', 'Respostas'
  ],

  BRIEF_A_INF: [
    'Data', 'Código', 'NomeAvaliado', 'DataNasc', 'Idade', 'Género', 'Escolaridade',
    'NomeInformante', 'Relação',
    'INIB', 'FLEX', 'CE', 'AUTOM', 'BRI',
    'INIC', 'MT', 'PO', 'MTAR', 'OM', 'MI',
    'GEC', 'INFREQ', 'INCONS', 'NRespondidos', 'Respostas'
  ],

  SCARED_R_CRIANCA: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Género', 'Ano',
    'NomeInformante',
    'Total', 'Classificação',
    'sub_Panico', 'sub_AG', 'sub_AS', 'sub_FS', 'sub_FE_total', 'sub_POC', 'sub_PSPT',
    'fe_FobiaEscola', 'fe_Situacional', 'fe_Sangue', 'fe_Animais',
    'Respostas'
  ],

  SCARED_R_PAIS: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Género', 'Ano',
    'NomeInformante', 'Relação',
    'Total', 'Classificação',
    'sub_Panico', 'sub_AG', 'sub_AS', 'sub_FS', 'sub_FE_total', 'sub_POC', 'sub_PSPT',
    'fe_FobiaEscola', 'fe_Situacional', 'fe_Sangue', 'fe_Animais',
    'Respostas'
  ],

  SPAS_Pais: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Idade', 'Género',
    'NomeInformante', 'Relação',
    'AG', 'AS', 'SEP', 'MDF', 'POC', 'Total', 'Respostas'
  ],

  SPAS_Prof: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Idade', 'Género',
    'NomeInformante', 'Relação', 'Instituição',
    'AG', 'AS', 'SEP', 'MDF', 'POC', 'Total', 'Respostas'
  ],

  QEDP: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante',
    'Dem_Media', 'Dem_T', 'Dem_Cls',
    'Aut_Media', 'Aut_T', 'Aut_Cls',
    'Per_Media', 'Per_T', 'Per_Cls',
    'Respostas'
  ],

  QC_Coparentalidade: [
    'Data', 'Código', 'NomeCriança', 'Respondente', 'Versao',
    'Cooperacao_Raw', 'Cooperacao_Media',
    'Triangulacao_Raw', 'Triangulacao_Media',
    'Conflito_Raw', 'Conflito_Media',
    'Respostas'
  ],

  DIVA5: [
    'Data', 'Código', 'NomeCriança', 'Respondente', 'Relação', 'Versão',
    'NívelDI', 'FaixaEtária',
    'Desatenção_Adultez', 'Desatenção_Infância',
    'HI_Adultez', 'HI_Infância',
    'Diagnóstico', 'Respostas',
    // ── v112.0 · 4 colunas ACRESCENTADAS NO FIM ────────────────────────────
    // Posições 1–14 deliberadamente intactas: as linhas já gravadas mantêm-se
    // alinhadas e 'Respostas' continua na coluna 14. Só é preciso escrever os
    // 4 cabeçalhos novos em O1:R1 da aba DIVA5.
    // Reconstroem o estado dos critérios no painel após sincronização — sem
    // elas, o bloco «Critério B» só funciona nos registos em localStorage.
    'CritérioA', 'CritérioB', 'RespAdultez', 'RespInfancia'
  ],

  ERC_Professores: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente', 'Relação',
    'SexoCriança', 'L/N', 'RE', 'Total', 'Respostas'
  ],

  ERC_Pais: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente', 'Relação',
    'SexoCriança', 'L/N', 'RE', 'Total', 'Respostas'
  ],

  EAFE: [
    'Data', 'Código', 'NomeJovem', 'NomeInformante',
    'DataNasc', 'AnoEscolaridade', 'Escola', 'Modo',
    'DE', 'DR', 'EE', 'DRE', 'Perfil',
    'Emoção14', 'Intensidade14',
    'ObsJovem', 'ObsAvaliador',
    'Respostas',
    'ALP', 'Versao'
  ],

  ECE_FEA: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'ScoreA', 'ScoreB', 'ScoreC', 'ScoreD', 'ScoreE',
    'IGAE', 'Respostas'
  ],

  RCADS_25CG: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'Sexo', 'Relação',
    'MDD_Raw', 'MDD_T', 'ANX_Raw', 'ANX_T', 'Total_Raw', 'Total_T',
    'SP', 'SAD', 'GAD', 'PD', 'OCD', 'Respostas'
  ],

  RCADS_25Y: [
    'Data', 'Código', 'NomeJovem', 'NomeEE',
    'Idade', 'Sexo', 'AnoEscolar',
    'MDD_Raw', 'MDD_T', 'ANX_Raw', 'ANX_T', 'Total_Raw', 'Total_T',
    'SP', 'SAD', 'GAD', 'PD', 'OCD', 'Respostas'
  ],

  RCADS_47CG: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'Sexo', 'Relação',
    'MDD_Raw', 'MDD_T', 'ANX_Raw', 'ANX_T', 'Total_Raw', 'Total_T',
    'SP', 'SP_T', 'SAD', 'SAD_T', 'GAD', 'GAD_T',
    'PD', 'PD_T', 'OCD', 'OCD_T', 'Respostas'
  ],

  RCADS_47Y: [
    'Data', 'Código', 'NomeJovem', 'NomeEE',
    'Idade', 'Sexo', 'AnoEscolar',
    'MDD_Raw', 'MDD_T', 'ANX_Raw', 'ANX_T', 'Total_Raw', 'Total_T',
    'SP', 'SP_T', 'SAD', 'SAD_T', 'GAD', 'GAD_T',
    'PD', 'PD_T', 'OCD', 'OCD_T', 'Respostas'
  ],

  EAT26: [
    'Data', 'Código', 'Nome', 'DataNasc', 'Sexo',
    'D', 'B', 'OC', 'Total', 'Rastreio',
    'B1', 'B2', 'B3', 'B4', 'B5', 'Respostas'
  ],

  CONNERS3P_FULL: [
    'Data', 'Codigo', 'NomeCrianca', 'NomeInformante', 'Relação', 'Idade',
    'Raw_IN', 'Raw_HI', 'Raw_LP', 'Raw_EF', 'Raw_AG', 'Raw_PR',
    'Raw_DSMI', 'Raw_DSMH', 'Raw_CD', 'Raw_ODD',
    'T_IN', 'T_HI', 'T_LP', 'T_EF', 'T_AG', 'T_PR',
    'T_DSMI', 'T_DSMH', 'T_CD', 'T_ODD', 'Respostas'
  ],

  CONNERS3T_FULL: [
    'Data', 'Codigo', 'NomeCrianca', 'NomeInformante', 'Relação', 'Idade',
    'Raw_IN', 'Raw_HI', 'Raw_LPEF', 'Raw_AG', 'Raw_PR',
    'Raw_DSMI', 'Raw_DSMH', 'Raw_CD', 'Raw_ODD',
    'T_IN', 'T_HI', 'T_LPEF', 'T_AG', 'T_PR',
    'T_DSMI', 'T_DSMH', 'T_CD', 'T_ODD', 'Respostas'
  ],

  CONNERS3PS: [
    'Data', 'Codigo', 'NomeCrianca', 'NomeInformante', 'Relação', 'Idade',
    'Raw_IN', 'Raw_HI', 'Raw_LP', 'Raw_EF', 'Raw_AG', 'Raw_PR',
    'T_IN', 'T_HI', 'T_LP', 'T_EF', 'T_AG', 'T_PR', 'Respostas'
  ],

  CONNERS3TS: [
    'Data', 'Codigo', 'NomeCrianca', 'NomeInformante', 'Relação', 'Idade',
    'Raw_IN', 'Raw_HI', 'Raw_LPEF', 'Raw_AG', 'Raw_PR',
    'T_IN', 'T_HI', 'T_LPEF', 'T_AG', 'T_PR', 'Respostas'
  ],

  FAD_GF: [
    'Data', 'Código', 'Nome Criança', 'Relação', 'Nome Respondente',
    'Score FAD-GF', 'Classificação', 'Respostas'
  ],

  FAD_60: [
    'Data', 'Código', 'Nome Criança', 'Relação', 'Nome Respondente',
    'Score_PS', 'Score_CO', 'Score_RO', 'Score_AR', 'Score_AI', 'Score_BC', 'Score_GF',
    'Class_PS', 'Class_CO', 'Class_RO', 'Class_AR', 'Class_AI', 'Class_BC', 'Class_GF',
    'Respostas'
  ],

  MAP_Parental: [
    'Data', 'Código', 'NomeCriança', 'NomeProgenitor', 'Relação', 'SituaçãoFamiliar', 'IdadesFilhos',
    'Likert_Média', 'Princípios',
    'N_DomíniosMelhorias', 'N_DomíniosBem', 'N_RotinasMelhorias',
    'Temas_Alinhamento', 'Temas_EstilosDiferentes', 'Divergência_Piora', 'Influência_Histórica',
    'Prioridades_Urgentes', 'Inadmissíveis', 'Rotinas_Fundamentais', 'Mudanças_Desejadas',
    'DadosCompletos'
  ],

  MAP_Parental_PI: [
    'Data', 'Código', 'NomeCriança', 'NomeProgenitor', 'Relação', 'SituaçãoFamiliar',
    'ContextoCuidados', 'IdadesFilhos',
    'Likert_Média', 'Princípios',
    'N_DomíniosMelhorias', 'N_RotinasMelhorias',
    'Temas_Alinhamento', 'Temas_EstilosDiferentes', 'Divergência_Piora', 'Influência_Histórica',
    'Prioridades_Urgentes', 'Inadmissíveis', 'Rotinas_Fundamentais', 'Mudanças_Desejadas',
    'DadosCompletos'
  ],

  MAP_Parental_1214: [
    'Data', 'Código', 'NomeCriança', 'NomeProgenitor', 'Relação', 'SituaçãoFamiliar', 'IdadesFilhos',
    'Likert_Média', 'Princípios',
    'N_DomíniosMelhorias', 'N_RotinasMelhorias',
    'Temas_Alinhamento', 'Temas_EstilosDiferentes', 'Divergência_Piora', 'Influência_Histórica',
    'Prioridades_Urgentes', 'Inadmissíveis', 'Rotinas_Fundamentais', 'Mudanças_Desejadas',
    'DadosCompletos'
  ],

  MAP_Parental_1518: [
    'Data', 'Código', 'NomeCriança', 'NomeProgenitor', 'Relação', 'SituaçãoFamiliar', 'IdadesFilhos',
    'Likert_Média', 'Princípios',
    'N_DomíniosMelhorias', 'N_RotinasMelhorias',
    'Temas_Alinhamento', 'Temas_EstilosDiferentes', 'Divergência_Piora', 'Influência_Histórica',
    'Prioridades_Urgentes', 'Inadmissíveis', 'Momentos_Fundamentais', 'Mudanças_Desejadas',
    'DadosCompletos'
  ],

  Anamnese_Complementar: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Respondidas', 'Respostas'
  ],

  PAIA: [
    'Código', 'NomePaciente', 'NomeRespondente', 'Sexo', 'Idade', 'Escola',
    'Data', 'Timestamp',
    'T_ICN',  'Raw_ICN',  'T_INF',  'Raw_INF',  'T_NIM',  'Raw_NIM',
    'T_PIM',  'Raw_PIM',  'T_SOM',  'Raw_SOM',  'T_ANS',  'Raw_ANS',
    'T_DEP',  'Raw_DEP',  'T_MAN',  'Raw_MAN',  'T_PAR',  'Raw_PAR',
    'T_ESQ',  'Raw_ESQ',  'T_BPD',  'Raw_BPD',  'T_ANT',  'Raw_ANT',
    'T_ALC',  'Raw_ALC',  'T_DRG',  'Raw_DRG',  'T_AGR',  'Raw_AGR',
    'T_SUI',  'Raw_SUI',  'T_STR',  'Raw_STR',  'T_NON',  'Raw_NON',
    'T_RXR',  'Raw_RXR',  'Respostas'
  ],

  PAI: [
    'Código', 'NomePaciente', 'NomeRespondente', 'Sexo', 'DataNasc',
    'Data', 'Timestamp',
    'T_SOM',  'Raw_SOM',  'T_ANX',  'Raw_ANX',  'T_ARD',  'Raw_ARD',
    'T_DEP',  'Raw_DEP',  'T_MAN',  'Raw_MAN',  'T_PAR',  'Raw_PAR',
    'T_SCZ',  'Raw_SCZ',  'T_BOR',  'Raw_BOR',  'T_ANT',  'Raw_ANT',
    'T_ALC',  'Raw_ALC',  'T_DRG',  'Raw_DRG',  'T_AGG',  'Raw_AGG',
    'T_SUI',  'Raw_SUI',  'T_STR',  'Raw_STR',  'T_NON',  'Raw_NON',
    'T_RXR',  'Raw_RXR',  'T_DOM',  'Raw_DOM',  'T_WRM',  'Raw_WRM',
    'Respostas'
  ],

  MBI_SS: [
    'Data', 'Código', 'NomeCrianca', 'NomeRespondente',
    'Curso', 'Ano', 'EX', 'DC', 'EF', 'Diagnostico', 'Respostas'
  ],

  PS2_Cuidador: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante', 'Relacao',
    'Procura', 'Evitamento', 'Sensibilidade', 'Registo',
    'Auditivo', 'Visual', 'Tatil', 'Movimento', 'Posicao',
    'Oral', 'Conduta', 'Socioemocional', 'Atencao',
    'ClassProcura', 'ClassEvitamento', 'ClassSensibilidade', 'ClassRegisto',
    'Respostas'
  ],

  PS2_Professor: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante', 'AnoEscolar', 'Frequencia',
    'Procura', 'Evitamento', 'Sensibilidade', 'Registo',
    'Auditivo', 'Visual', 'Tatil', 'Movimento', 'Comportamento',
    'FatorEscolar1', 'FatorEscolar2', 'FatorEscolar3', 'FatorEscolar4',
    'Respostas'
  ],

  IPP_R: [
    'Data', 'Código', 'Ano',
    'TotalA', 'TotalB', 'TotalC', 'TotalD', 'Respostas'
  ],

  IMC_C: [
    'Data', 'Código', 'NomeCriança', 'AnoEscolar',
    'Preocupação', 'Curiosidade', 'Confiança', 'Consulta', 'Total', 'Respostas'
  ],

  IVP_Super: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente', 'AnoEscolar',
    'Criatividade', 'Altruísmo', 'Estético', 'Estimulação Intelectual',
    'Êxito', 'Independência', 'Prestígio', 'Direcção', 'Económico',
    'Segurança', 'Ambiente', 'Relação com os Superiores',
    'Relação com os Colegas', 'Variedade', 'Género de Vida', 'Respostas'
  ],

  SDS_Holland: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Percurso', 'Escola',
    'Código_Holland',
    'R_total', 'I_total', 'A_total', 'S_total', 'E_total', 'C_total',
    'R_act',   'I_act',   'A_act',   'S_act',   'E_act',   'C_act',
    'R_comp',  'I_comp',  'A_comp',  'S_comp',  'E_comp',  'C_comp',
    'R_carr',  'I_carr',  'A_carr',  'S_carr',  'E_carr',  'C_carr',
    'R_apt',   'I_apt',   'A_apt',   'S_apt',   'E_apt',   'C_apt',
    'Respostas'
  ],

  JTCI_92: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'DataNasc', 'Género', 'AnoEscolar',
    'NS', 'HA', 'RD', 'P', 'SD', 'CO', 'Respostas'
  ],

  NEOPIR: [
    'Data', 'Código', 'NomeInformante', 'Sexo', 'GrupoEtario', 'DataAvaliacao',
    'SB_N1','PC_N1','SB_N2','PC_N2','SB_N3','PC_N3',
    'SB_N4','PC_N4','SB_N5','PC_N5','SB_N6','PC_N6',
    'SB_E1','PC_E1','SB_E2','PC_E2','SB_E3','PC_E3',
    'SB_E4','PC_E4','SB_E5','PC_E5','SB_E6','PC_E6',
    'SB_O1','PC_O1','SB_O2','PC_O2','SB_O3','PC_O3',
    'SB_O4','PC_O4','SB_O5','PC_O5','SB_O6','PC_O6',
    'SB_A1','PC_A1','SB_A2','PC_A2','SB_A3','PC_A3',
    'SB_A4','PC_A4','SB_A5','PC_A5','SB_A6','PC_A6',
    'SB_C1','PC_C1','SB_C2','PC_C2','SB_C3','PC_C3',
    'SB_C4','PC_C4','SB_C5','PC_C5','SB_C6','PC_C6',
    'SB_N','PC_N','SB_E','PC_E','SB_O','PC_O',
    'SB_A','PC_A','SB_C','PC_C',
    'Respostas'
  ],

  CSSRS: [
    'Data', 'Código', 'Nome', 'Versão', 'Avaliador', 'Idade', 'Contexto',
    'IdeacaoMaxTipo',
    'TentativaReal', 'TentativaInterrompida', 'TentativaAbortada', 'ActosPreparatorios',
    'NivelRisco', 'NivelRiscoTexto',
    'Notas', 'Respostas'
  ],

  BSI: [
    'Data', 'Codigo', 'NomeCrianca', 'NomeInquirido', 'GrauParentesco',
    'IGS', 'TSP', 'ISP',
    'Som', 'ObsComp', 'SensInt', 'Dep', 'Ans', 'Hos', 'AnsFob', 'IdeaPar', 'Psic',
    'Answers'
  ],

  BESAA: [
    'Data', 'Código', 'NomePaciente', 'NomeRespondente', 'Género', 'Relação',
    'Score_Aparencia', 'Score_Peso', 'Score_Atribuicao', 'Score_Total',
    'Nivel_Aparencia', 'Nivel_Peso',
    'Respostas'
  ],

  EDEQ: [
    'Data', 'Código', 'Nome', 'DataNasc', 'Sexo',
    'Restraint', 'EatingConcern', 'ShapeConcern', 'WeightConcern', 'Global',
    'Q13_OBE', 'Q14_OBE_ctrl', 'Q15_dias', 'Q16_vomito', 'Q17_laxantes', 'Q18_exercicio',
    'Respostas'
  ],

  SEQ_C: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'AnoEscolar', 'Género', 'Retenções',
    'AE_Acad', 'AE_Social', 'AE_Emoc', 'AE_Global',
    'ZonaAcad', 'ZonaSocial', 'ZonaEmoc', 'ZonaGlobal',
    'MediaAcad', 'MediaSocial', 'MediaEmoc',
    'Respostas'
  ],

  Collins_Silhuetas: [
    'Data', 'Código', 'Género', 'Idade', 'Peso', 'Altura', 'IMC',
    'Grupo', 'SilReal', 'SilIdeal', 'Insatisfacao',
    'Avaliacao', 'Desejo'
  ],

  OBS_PHDA_Casa: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Medicação',
    'Med1_Nome', 'Med1_Dose', 'Med1_Hora',
    'Med2_Nome', 'Med2_Dose', 'Med2_Hora',
    'Med3_Nome', 'Med3_Dose', 'Med3_Hora',
    'Score_Manha_Atencao', 'Score_Manha_Emocao', 'Score_Manha_Social',
    'Score_Manha_Motora',  'Score_Manha_Bestar',
    'Score_Tarde_Atencao', 'Score_Tarde_Emocao', 'Score_Tarde_Social',
    'Score_Tarde_Motora',  'Score_Tarde_Bestar',
    'Score_Noite_Atencao', 'Score_Noite_Emocao',
    'Score_Noite_Motora',  'Score_Noite_Bestar',
    'Score_Atencao', 'Score_Emocao', 'Score_Social',
    'Score_Motora',  'Score_Bestar',
    'ObsLivres', 'Timestamp'
  ],

  OBS_PHDA_Escola: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'AnoEscolar', 'Medicação',
    'Med_Contexto',
    'Med1_Nome', 'Med1_Dose', 'Med1_Hora',
    'Med2_Nome', 'Med2_Dose', 'Med2_Hora',
    'Med3_Nome', 'Med3_Dose', 'Med3_Hora',
    'Score_Manha_Atencao', 'Score_Manha_Emocao', 'Score_Manha_Social', 'Score_Manha_Motora',
    'Score_Tarde_Atencao', 'Score_Tarde_Emocao', 'Score_Tarde_Social', 'Score_Tarde_Motora',
    'Score_Atencao', 'Score_Emocao', 'Score_Social', 'Score_Motora',
    'ObsLivres', 'Timestamp'
  ],

  ECS: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente',
    'Idade', 'Sexo', 'Escolaridade', 'EstadoCivil', 'Profissao',
    'Total', 'Adaptabilidade', 'Expressividade',
    'Media_Total', 'Media_Adapt', 'Media_Expr',
    'Z_Total',
    'Nivel_Total', 'Nivel_Adapt', 'Nivel_Expr',
    'Respostas'
  ],

  // ── DERS — Dificuldades de Regulação Emocional ─────────────
  // Gratz & Roemer (2004); PT: Pinto Gouveia & Veloso (2007); Coutinho et al. (2010)
  // Normas: Sousa et al. (2023) adolescentes 14–18; Coutinho et al. (2010) adultos
  DERS: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'Sexo', 'Faixa',
    'NA_Raw', 'NA_Z', 'NA_Class',
    'OBJ_Raw', 'OBJ_Z', 'OBJ_Class',
    'IMP_Raw', 'IMP_Z', 'IMP_Class',
    'CON_Raw', 'CON_Z', 'CON_Class',
    'EST_Raw', 'EST_Z', 'EST_Class',
    'CLA_Raw', 'CLA_Z', 'CLA_Class',
    'TOT_Raw', 'TOT_Z', 'TOT_Class',
    'Respostas'
  ],

  // ── COMPA — Escala de Avaliação da Comunicação na Parentalidade ──
  // (Portugal & Alberto, 2014) · Escala 1.00–5.00 · Cut-offs: <2 / <3 / <3.75 / <4.5 / ≥4.5
  COMPA_P: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante', 'Relacao', 'Idade', 'Sexo',
    'F1', 'F2', 'F3', 'F4', 'F5', 'Total', 'Respostas'
  ],
  COMPA_A_Pai: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante', 'Idade', 'Sexo',
    'F1', 'F2', 'F3', 'F4', 'F5', 'Total', 'Respostas'
  ],
  COMPA_A_Mae: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante', 'Idade', 'Sexo',
    'F1', 'F2', 'F3', 'F4', 'F5', 'Total', 'Respostas'
  ],
  COMPA_C_Pai: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante', 'Idade', 'Sexo',
    'F1', 'F2', 'Total', 'Respostas'
  ],
  COMPA_C_Mae: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante', 'Idade', 'Sexo',
    'F1', 'F2', 'Total', 'Respostas'
  ],

  // ── CDI-2:SR — Inventário de Depressão em Crianças (Auto-relato) ──────
  // Kovacs & MHS Staff (2011) · 28 itens · 7-17 anos · Escala 0-1-2
  // T-Score Total via tabela normativa por sexo×grupo etário (M712/F712/M1317/F1317)
  CDI2_SR: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'DataNasc', 'Sexo', 'Idade', 'GrupoEtario',
    'TOTAL_RAW', 'EP_RAW', 'FP_RAW',
    'HM_SF_RAW', 'AE_RAW', 'INE_RAW', 'PI_RAW',
    'TOTAL_T', 'ITEM9', 'Respostas'
  ],

  // ── STAIC C-2 — Inventário de Ansiedade Estado-Traço para Crianças (A-Traço) ──
  // Spielberger et al. (1973) · trad. PT Dias & Gonçalves (1999) · 20 itens · 8-17 anos
  // Escala Likert 1-3 · 1 escala única (Total) · amplitude 20-60
  // Cotação tecnicamente corrigida: APENAS item 4 invertido (item 5 NÃO invertido).
  // 3 normas calculadas em paralelo (Spielberger 1973 / Biaggio 1980 / D&G PT estim.).
  // Cortes raw clínicos: ≥40 (Strauss 1988) e ≥45 (Spielberger conservador).
  STAIC_C2: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'DataNasc', 'Sexo', 'Idade',
    'TOTAL_RAW', 'Z_SPIELBERGER', 'Z_BIAGGIO', 'Z_DG_PT',
    'SEXO_APLICADO_SPIEL', 'SEXO_APLICADO_DG',
    'CORTE_STRAUSS', 'CORTE_CONSERVADOR', 'CLASSIFICACAO', 'NORMA_PRIMARIA',
    'Respostas'
  ],

  // ── CMAS-R — Questionário de Avaliação da Ansiedade Manifesta para Crianças ──
  // Reynolds & Richmond (1978) · trad. PT Dias & Gonçalves (1999) · 37 itens · 8-17 anos
  // Resposta binária Sim=1/Não=0 · sem itens invertidos
  // 2 escalas: Ansiedade Total (28 itens) + Mentira/Validade (9 itens)
  // Tabela T-score discreta (raw→T fixo, Folha de Perfil D&G U.Minho)
  // Limiares Ansiedade T: <40 muito baixa | 40-59 média | 60-64 elevada subclínica | 65-69 muito elevada | ≥70 clinicamente sig.
  // Limiares Mentira T: <60 típica | 60-69 elevada | ≥70 muito elevada (validade comprometida)
  CMAS_R: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'DataNasc', 'Sexo', 'Idade',
    'ANS_RAW', 'ANS_T', 'ANS_CLASSIF',
    'LIE_RAW', 'LIE_T', 'LIE_CLASSIF',
    'VALIDADE_OK', 'Respostas'
  ],

  // ── FSSC-R — Inventário de Medos para Crianças (Revisto) ──────────────
  // Ollendick (1978/1983) · trad. PT Dias & Gonçalves (1999) · 80 itens · 8-17 anos
  // Likert 3 níveis (Nada/Pouco/Muito) · sem itens invertidos · cotação dupla calculada
  // Cotação 0-1-2 (D&G PT) e 1-2-3 (Ollendick literatura) calculadas em paralelo
  // 5 fatores Ollendick (1983): F1 Falhanço/Crítica · F2 Desconhecido · F3 Animais/Ferimentos · F4 Perigo/Morte · F5 Médico
  // 4 normas em paralelo no Total: Sandín 1998 (primária) · Turgeon 2005 · Ollendick 1983 · D&G PT estim.
  // Z dos fatores calculado com Sandín (norma primária); MUITO_TOTAL = nº itens cotados "Muito" (idx=2)
  // Item 51 corrigido = "Ir ao dentista" (texto original duplicava o item 22)
  FSSC_R: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'DataNasc', 'Sexo', 'Idade',
    'TOTAL_RAW_012', 'TOTAL_RAW_123',
    'F1_RAW', 'F2_RAW', 'F3_RAW', 'F4_RAW', 'F5_RAW',
    'Z_TOTAL_SANDIN', 'Z_TOTAL_TURGEON', 'Z_TOTAL_OLLENDICK', 'Z_TOTAL_DG_PT',
    'Z_F1', 'Z_F2', 'Z_F3', 'Z_F4', 'Z_F5',
    'MUITO_TOTAL', 'MUITO_F1', 'MUITO_F2', 'MUITO_F3', 'MUITO_F4', 'MUITO_F5',
    'CLASSIF_MUITO', 'SEXO_APLICADO_SANDIN',
    'CLASSIFICACAO', 'NORMA_PRIMARIA',
    'Respostas'
  ],

  // ── Sociograma · Mapa Social — v1.0 ───────────────────────────────────
  // Moreno (1934) sociometria · Coie & Dodge (1988) estatuto sociométrico
  // Bronfenbrenner (1979) microssistema · Cillessen & Marks (2011) peer assessment
  // Resnick et al. (1997) school connectedness · Hagerty et al. (1992) belonging
  // Instrumento qualitativo/relacional — sem T-scores. 6-18 anos.
  // Múltiplos respondentes: próprio / pais / professor (TipoRespondente).
  SOCIOGRAMA: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'TipoRespondente',
    'Idade', 'AnoTurma', 'TempoTurma',
    'DensidadeApoio', 'Reciprocidade', 'SinaisExclusao', 'SentidoPertenca',
    'AdultoConfianca', 'NRefugios', 'NEvitados', 'DiscrepanciaSelfOther',
    'Flags', 'Respostas'
  ],

  // ── PALS_Parent — Patterns of Adaptive Learning Scales (Pais) ─────────
  // Midgley et al. (2000) · 37 itens · adaptação portuguesa não validada
  // 8 subescalas: P1.1 P1.2 P1.3 (orientações filho) ·
  // P2.1 P2.2 P2.3 (perceção clima escola) · P3 P4 (eficácia + afeto)
  // 2 polaridades macro: POP (Padrão Orientação Pais), PCEP (Padrão
  // Clima Eficácia/Afeto Parental)
  // 9 índices clínicos: IFP IPCA IRPA ICEFM ICEFP IRPF IIP IPI IDC
  PALS_Parent: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Relacao', 'IdadeCriança', 'AnoEscolar',
    'M_P1_1', 'M_P1_2', 'M_P1_3', 'M_P2_1', 'M_P2_2', 'M_P2_3', 'M_P3', 'M_P4',
    'P_POP', 'P_PCEP',
    'I_IFP', 'I_IPCA', 'I_IRPA', 'I_ICEFM', 'I_ICEFP',
    'I_IRPF', 'I_IIP', 'I_IPI', 'I_IDC',
    'Respostas'
  ],

  // ── PALS_Teacher — PALS (Professores) ─────────────────────────────────
  // Midgley et al. (2000) · 38 itens · adaptação portuguesa não validada
  // 7 subescalas: T1.1 T1.2 T1.3 (estruturas meta sala) ·
  // T2.1 T2.2 (abordagens instrução) · T3 T4 (eficácia + afeto docente)
  // 2 polaridades macro: PCS (Padrão Clima Sala), PCI (Padrão Clima
  // Instrucional)
  // 5 índices clínicos: IFD IRBD ICA ICP IRP
  PALS_Teacher: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Relacao', 'Disciplina', 'AnosExperiencia',
    'M_T1_1', 'M_T1_2', 'M_T1_3', 'M_T2_1', 'M_T2_2', 'M_T3', 'M_T4',
    'P_PCS', 'P_PCI',
    'I_IFD', 'I_ICA', 'I_ICP', 'I_IRP', 'I_IRBD',
    'Respostas'
  ],

  // ── PALS_Student_Sec — PALS Aluno (Secundário) ────────────────────────
  // Midgley et al. (2000) · 84 itens · 14-18 anos
  // 18 subescalas: A1 A2 A3 A4 (orientações pessoais) ·
  // B1 B2 B3 (clima sala) · C1-C7 (eficácia + estratégias) ·
  // D1 D2 D3 D4 (família + vocacional)
  // 5 índices: IFAA IRM IEA IDPCm IDPCp
  // 4 eixos motivacionais: approx, evit, dom, desemp
  // 8 perfis (P1-P8) — inclui P8 foco vocacional adaptativo
  PALS_Student_Sec: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'AnoEscolar', 'Genero',
    'M_A1', 'M_A2', 'M_A3', 'M_A4',
    'M_B1', 'M_B2', 'M_B3',
    'M_C1', 'M_C2', 'M_C3', 'M_C4', 'M_C5', 'M_C6', 'M_C7',
    'M_D1', 'M_D2', 'M_D3', 'M_D4',
    'I_IFAA', 'I_IRM', 'I_IEA', 'I_IDPCm', 'I_IDPCp',
    'E_approx', 'E_evit', 'E_dom', 'E_desemp',
    'Respostas'
  ],

  // ── PALS_Student_23c — PALS Aluno (2.º e 3.º ciclo) ───────────────────
  // Midgley et al. (2000) · 84 itens · 10-14 anos
  // Estrutura idêntica ao Secundário mas linguagem adaptada
  // (B3, C5, C6, C7) e ausência de perfil P8 (apenas P1-P7).
  PALS_Student_23c: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'AnoEscolar', 'Genero',
    'M_A1', 'M_A2', 'M_A3', 'M_A4',
    'M_B1', 'M_B2', 'M_B3',
    'M_C1', 'M_C2', 'M_C3', 'M_C4', 'M_C5', 'M_C6', 'M_C7',
    'M_D1', 'M_D2', 'M_D3', 'M_D4',
    'I_IFAA', 'I_IRM', 'I_IEA', 'I_IDPCm', 'I_IDPCp',
    'E_approx', 'E_evit', 'E_dom', 'E_desemp',
    'Respostas'
  ],

  // ── PALS_Parent_Red — PALS Pais (Versão Reduzida) ─────────────────────
  // Midgley et al. (2000) · 21 itens · adaptação portuguesa.
  // Mesma estrutura factorial da versão completa: 8 subescalas,
  // 2 polaridades macro, 9 índices clínicos, 7 perfis.
  PALS_Parent_Red: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Relacao', 'IdadeCriança', 'AnoEscolar',
    'M_P1_1', 'M_P1_2', 'M_P1_3', 'M_P2_1', 'M_P2_2', 'M_P2_3', 'M_P3', 'M_P4',
    'P_POP', 'P_PCEP',
    'I_IFP', 'I_IPCA', 'I_IRPA', 'I_ICEFM', 'I_ICEFP',
    'I_IRPF', 'I_IIP', 'I_IPI', 'I_IDC',
    'Respostas'
  ],

  // ── PALS_Teacher_Red — PALS Professores (Versão Reduzida) ─────────────
  // Midgley et al. (2000) · 20 itens · adaptação portuguesa.
  // Mesma estrutura factorial: 7 subescalas, 2 polaridades, 5 índices, 6 perfis.
  PALS_Teacher_Red: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Relacao', 'Disciplina', 'AnosExperiencia',
    'M_T1_1', 'M_T1_2', 'M_T1_3', 'M_T2_1', 'M_T2_2', 'M_T3', 'M_T4',
    'P_PCS', 'P_PCI',
    'I_IFD', 'I_ICA', 'I_ICP', 'I_IRP', 'I_IRBD',
    'Respostas'
  ],

  // ── PALS_Student_Sec_Red — PALS Aluno Secundário (Versão Reduzida) ────
  // Midgley et al. (2000) · 46 itens · 14-18 anos.
  // Mesma estrutura factorial: 18 subescalas, 5 índices, 4 eixos, 8 perfis (inclui P8 vocacional).
  PALS_Student_Sec_Red: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'AnoEscolar', 'Genero',
    'M_A1', 'M_A2', 'M_A3', 'M_A4',
    'M_B1', 'M_B2', 'M_B3',
    'M_C1', 'M_C2', 'M_C3', 'M_C4', 'M_C5', 'M_C6', 'M_C7',
    'M_D1', 'M_D2', 'M_D3', 'M_D4',
    'I_IFAA', 'I_IRM', 'I_IEA', 'I_IDPCm', 'I_IDPCp',
    'E_approx', 'E_evit', 'E_dom', 'E_desemp',
    'Respostas'
  ],

  // ── PALS_Student_23c_Red — PALS Aluno 2.º/3.º Ciclo (Versão Reduzida) ─
  // Midgley et al. (2000) · 46 itens · 10-14 anos.
  // Estrutura idêntica ao Sec_Red mas linguagem adaptada e sem perfil P8.
  PALS_Student_23c_Red: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'Idade', 'AnoEscolar', 'Genero',
    'M_A1', 'M_A2', 'M_A3', 'M_A4',
    'M_B1', 'M_B2', 'M_B3',
    'M_C1', 'M_C2', 'M_C3', 'M_C4', 'M_C5', 'M_C6', 'M_C7',
    'M_D1', 'M_D2', 'M_D3', 'M_D4',
    'I_IFAA', 'I_IRM', 'I_IEA', 'I_IDPCm', 'I_IDPCp',
    'E_approx', 'E_evit', 'E_dom', 'E_desemp',
    'Respostas'
  ],

  // ── QEE_Escola — Questionário Ecológico Escolar (DT/Professor) ────────
  // Versão clínica revista · 40 itens fechados (escala 0-4) + 4 qualitativos
  // 8 escalas: IPS(5), SR(5), SI(6), RC(5), PDP(5), FAA(5), ACA(5), FPC(4)
  // 6 índices: II, IE, IPD, IAG, IRP, IGPC
  // 1 item invertido: E1.5 ("Permanece isolado")
  QEE_Escola: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'data_nasc', 'ano_turma', 'funcao', 'tempo_conhec',
    'M_IPS', 'M_SR', 'M_SI', 'M_RC', 'M_PDP', 'M_FAA', 'M_ACA', 'M_FPC',
    'Idx_II', 'Idx_IE', 'Idx_IPD', 'Idx_IAG', 'Idx_IRP', 'Idx_IGPC',
    'QualA', 'QualB', 'QualC', 'QualD',
    'Respostas'
  ],

  // ── QEP_Pais — Questionário Ecológico Parental (Pais/Cuidadores) ──────
  // Versão clínica revista · 40 itens fechados (escala 0-4) + 4 qualitativos
  // Estrutura paralela ao QEE — substitui FAA→FAG e FPC→FPF, mantém escalas.
  // 1 item invertido: P1.5 ("Refere sentir-se excluído(a)")
  QEP_Pais: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'data_nasc', 'ano_escolar', 'parentesco', 'coabitacao',
    'M_IPS', 'M_SR', 'M_SI', 'M_RC', 'M_PDP', 'M_FAG', 'M_ACA', 'M_FPF',
    'Idx_II', 'Idx_IE', 'Idx_IPD', 'Idx_IAG', 'Idx_IRP', 'Idx_IGPC',
    'QualA', 'QualB', 'QualC', 'QualD',
    'Respostas'
  ],

  // ── IIM (Inventário de Inteligências Múltiplas — Gardner 1983/1995) ──
  // Estrutura comum: 8 médias subescalares + 8 índices + perfil + alertas
  IIM_Hetero: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'data_nasc', 'relacao', 'tempo_conhec',
    'M_LING', 'M_LOGM', 'M_ESPA', 'M_MUSI', 'M_CORP', 'M_INTER', 'M_INTRA', 'M_NATU',
    'Idx_IIA', 'Idx_IIES', 'Idx_IIP', 'Idx_IIN', 'Idx_IGM', 'Idx_IDE', 'Idx_DIE', 'Idx_DOM',
    'Perfil', 'Alertas',
    'Respostas'
  ],

  IIM_Criancas: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'idade', 'ano_escola', 'genero',
    'M_LING', 'M_LOGM', 'M_ESPA', 'M_MUSI', 'M_CORP', 'M_INTER', 'M_INTRA', 'M_NATU',
    'Idx_IIA', 'Idx_IIES', 'Idx_IIP', 'Idx_IIN', 'Idx_IGM', 'Idx_IDE', 'Idx_DIE', 'Idx_DOM',
    'Perfil', 'Alertas',
    'Respostas'
  ],

  IIM_AdolAdultos: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'idade', 'escolaridade', 'genero',
    'M_LING', 'M_LOGM', 'M_ESPA', 'M_MUSI', 'M_CORP', 'M_INTER', 'M_INTRA', 'M_NATU',
    'Idx_IIA', 'Idx_IIES', 'Idx_IIP', 'Idx_IIN', 'Idx_IGM', 'Idx_IDE', 'Idx_DIE', 'Idx_DOM',
    'Perfil', 'Alertas',
    'Respostas'
  ],

  // ── CERQ (Cognitive Emotion Regulation Questionnaire — Garnefski et al.) ──
  // CERQ-K: 9 subescalas × 4 itens · normativos Garnefski et al. (2007)
  CERQ_K: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'idade', 'genero', 'escolaridade',
    'M_AUT', 'M_ACE', 'M_RUM', 'M_RP', 'M_PLA', 'M_REA', 'M_CP', 'M_CAT', 'M_CO',
    'CERQ_P', 'CERQ_N', 'Tipologia',
    'Respostas'
  ],

  // CERQ-18: 8 subescalas (RPP funde Reavaliação+Planeamento, 4 itens) · Soares & Amaral (2024)
  CERQ_18: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'idade', 'genero', 'escolaridade',
    'M_AUT', 'M_ACE', 'M_RUM', 'M_RP', 'M_RPP', 'M_CP', 'M_CAT', 'M_CO',
    'CERQ_P', 'CERQ_N', 'Tipologia',
    'Respostas'
  ],

  // CERQ-36: 9 subescalas × 4 itens (intercaladas) · Castro et al. (2013), adaptação PT
  CERQ_36: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'idade', 'genero', 'escolaridade',
    'M_AUT', 'M_ACE', 'M_RUM', 'M_RP', 'M_PLA', 'M_REA', 'M_CP', 'M_CAT', 'M_CO',
    'CERQ_P', 'CERQ_N', 'Tipologia',
    'Respostas'
  ],

  // ── ERICA (Emotion Regulation Index for Children and Adolescents) ──
  // MacDermott et al. (2010) · Adaptação PT: Reverendo & Machado (2010)
  // Auto-relato 9-16 anos · 3 subescalas (CE, AE, RS) + ERICA Total
  // M_* = média/item (após inversão automática); ERICA_S = soma corrigida (16-80)
  ERICA: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'idade', 'genero', 'ano_escolar',
    'M_CE', 'M_AE', 'M_RS',
    'ERICA_M', 'ERICA_S', 'Tipologia',
    'Respostas'
  ],

  // ── ERQ-CA (Emotion Regulation Questionnaire for Children and Adolescents) ──
  // Gullone & Taffe (2012) · Tradução PT: Ana Nunes (não validada)
  // Auto-relato 10-18 anos · 2 subescalas (RC, SE) · sem inversões
  // M_* = média/item (1-5); S_* = soma bruta (RC: 6-30, SE: 4-20)
  ERQ_CA: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'idade', 'genero', 'ano_escolar',
    'M_RC', 'M_SE', 'S_RC', 'S_SE',
    'Tipologia',
    'Respostas'
  ],

  // ── STAXI-NA (State-Trait Anger Expression Inventory para Crianças e Adolescentes) ──
  // Del Barrio, Aluja & Spielberger (2004) · Tradução PT: Ana Nunes (não validada)
  // Auto-relato 9-18 anos · 32 itens · escala 1-3 · sem inversões
  // Normativos brasileiros (Costa & Frizzo, 2012) — referência aproximativa
  // M_* = média/item (1-3, comparável com normativos)
  // 8 subescalas (4 itens cada) + 4 escalas globais (média das 2 subs correspondentes)
  STAXI_NA: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante',
    'idade', 'genero', 'ano_escolar',
    // Subescalas (8) — média/item
    'M_SR', 'M_RFV', 'M_TR', 'M_RR',
    'M_EROUT', 'M_ERIN', 'M_CROUT', 'M_CRIN',
    // Escalas globais (4) — média/item
    'M_ER', 'M_RT', 'M_EXR', 'M_CR',
    'Tipologia',
    'Respostas'
  ],

  // ── MDQ (Mood Disorder Questionnaire) ──
  // Hirschfeld et al. (2000); validação PT-BR Gurgel et al. (2012)
  // Auto-aplicação em adultos · 15 itens · ~3-5 min
  // Soma_P1 = sintomas (0-13); P2 = co-ocorrência (0/1); P3 = impacto (0-3)
  // C1-C6 = clusters sintomáticos; classificação em 4 níveis
  MDQ: [
    'Data', 'Código', 'NomeUtente', 'Respondente',
    'Idade', 'Sexo',
    'Soma_P1', 'P2', 'P3',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
    'Classificação', 'Alertas',
    'Respostas'
  ],

  // ── AQ Buss-Perry — Questionário de Agressividade ───────────
  // Buss & Perry (1992); adaptação portuguesa Cunha & Gonçalves (2012)
  // Auto-aplicação em adultos · 29 itens · 4 subescalas + Total
  // Categoria: Personalidade — Agressividade. Subescalas: AF, AV, IR (Raiva), HO (Hostilidade).
  // Itens invertidos: 9 e 16 (6 − resposta). Privacidade: scores NUNCA visíveis ao paciente.
  AQ_BussPerry: [
    'Data', 'Código', 'NomeAvaliado', 'Idade', 'Sexo', 'NomeInformante',
    'AF_Bruto', 'AV_Bruto', 'IR_Bruto', 'HO_Bruto', 'TOTAL_Bruto',
    'AF_Classe', 'AV_Classe', 'IR_Classe', 'HO_Classe', 'TOTAL_Classe',
    'Respostas'
  ],

  // ── ChEAT — Children's Eating Attitude Test ────────────────
  // Maloney et al. (1988); versão portuguesa Barillari et al. (2011)
  // Auto-resposta criança 8–13 anos · 26 itens · 3 subescalas + Total
  // Subescalas: Dieta/Restrição (10 itens, máx 30), Preocupação Alimentar (12, máx 36), Bulimia/Controlo (4, máx 12)
  // Itens invertidos: 19 e 25 (escala 0/1/2/2/2/3). Ponto de corte clínico: Total ≥ 20.
  // Privacidade: scores e classificações NUNCA visíveis à criança.
  ChEAT: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante',
    'DataNasc', 'AnoEscolar',
    'Total', 'Dieta_Restricao', 'Preoc_Alimentar', 'Bulimia_Controlo',
    'Risco', 'Interpretacao',
    'Respostas'
  ],

  // ── AQ-Child — Quociente de Espectro do Autismo (Versão Criança) ──
  // Auyeung, Baron-Cohen, Wheelwright & Allison (2008); tradução PT Coelho (2020)
  // Preenchimento por pais/cuidadores · crianças 4–11 anos · 50 itens · Likert 4 pontos
  // 24 itens directos [3,2,1,0] + 26 itens reversos [0,1,2,3]
  // 5 subescalas (10 itens cada): S, A, D, C, I — Total 0–150
  // Cut-off clínico ≥ 76 (Sens. 95% · Espec. 95%)
  AQ_Child: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Sexo',
    'NomeInformante', 'Relação',
    'S', 'A', 'D', 'C', 'I',
    'Total', 'Classificacao',
    'Respostas'
  ],

  // ── ISS-I / ESI — Inventário de Sintomas de Stress Infantil ──
  // Lucarelli & Lipp (1998) · adaptação técnica PT-PT · 6-14 anos
  // 33 itens (escala 0-4) em 4 domínios + TOTAL · sem normas PT (criterial)
  // F: itens 1-9 (max 36) · P: itens 10-18 (max 36)
  // D: itens 19-27 (max 36) · PF: itens 28-33 (max 24) · TOTAL max 132
  // Itens sentinela: 22, 23, 24, 25 (alerta clínico se ≥ 2)
  ISS_ESI: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante',
    'DataNasc', 'Idade', 'Sexo', 'AnoEscolar', 'Faixa',
    'F_Soma', 'F_Pct', 'F_Banda',
    'P_Soma', 'P_Pct', 'P_Banda',
    'D_Soma', 'D_Pct', 'D_Banda',
    'PF_Soma', 'PF_Pct', 'PF_Banda',
    'TOTAL_Soma', 'TOTAL_Pct', 'TOTAL_Banda',
    'Sentinelas_Activas', 'Respostas'
  ],

  // ── C-SSRS-P — Risco Suicidário · Versão Pediátrica ──
  // Ricardina Correia (2026) · 6-11 anos · aplicação por entrevistador
  // Auto + Hetero · 17 itens × 2 janelas (Vida + 3 meses)
  // Bloco B com 5 itens (escala 0-2 · soma 0-10)
  // Cortes B: Baixa 0-3 · Média 4-6 · Alta 7-10
  // Classificação hierárquica: Mínimo → Baixo → Moderado → Elevado → Crítico
  C_SSRS_P: [
    'Data', 'Código', 'Tipo', 'NomeCriança', 'DataNasc', 'Idade', 'Sexo', 'DataAplicacao',
    'Avaliador', 'Contexto', 'Diagnostico', 'Observacoes', 'NomeInformante', 'Relação',
    'Convivencia', 'FreqContacto',
    'NivelA_V', 'NivelA_3', 'IntensB_V', 'IntensB_3',
    'Comp_V', 'Comp_3', 'ANS_V', 'ANS_3', 'LetMax_V', 'LetMax_3',
    'Class_V', 'Class_3', 'Respostas'
  ],

  // ── C-SSRS-A — Risco Suicidário · Versão Adolescente ──
  // Ricardina Correia (2026) · 12-18 anos · autoavaliação com supervisão
  // SÓ Auto (sem hetero) · 17 itens × 2 janelas (Vida + 3 meses)
  // Bloco B com 5 itens (escala 1-5 · soma 5-25)
  // Cortes B: Baixa 5-10 · Média 11-17 · Alta 18-25
  // Schema sem Convivencia/FreqContacto (não há hetero)
  C_SSRS_A: [
    'Data', 'Código', 'Tipo', 'NomeAdolescente', 'DataNasc', 'Idade', 'Sexo', 'DataAplicacao',
    'Avaliador', 'Contexto', 'Diagnostico', 'Observacoes', 'NomeInformante', 'Relação',
    'NivelA_V', 'NivelA_3', 'IntensB_V', 'IntensB_3',
    'Comp_V', 'Comp_3', 'ANS_V', 'ANS_3', 'LetMax_V', 'LetMax_3',
    'Class_V', 'Class_3', 'Respostas'
  ],

  // ── C-SSRS-DC — Risco Suicidário · Versão Défice Cognitivo ──
  // Ricardina Correia (2026) · qualquer idade c/ limitação de auto-relato
  // Auto + Hetero · aplicação por entrevistador c/ suportes visuais
  // Bloco A inclui opção "Não compreende" (tipo snnc — Sim/Não/NC)
  // Bloco B com APENAS 3 itens (Frequência, Controlabilidade, Razões para viver · 0-2 · soma 0-6)
  // Cortes B: Baixa 0-2 · Média 3-4 · Alta 5-6
  // Schema idêntico ao C_SSRS_P (NC fica codificado no campo Respostas)
  C_SSRS_DC: [
    'Data', 'Código', 'Tipo', 'NomeCriança', 'DataNasc', 'Idade', 'Sexo', 'DataAplicacao',
    'Avaliador', 'Contexto', 'Diagnostico', 'Observacoes', 'NomeInformante', 'Relação',
    'Convivencia', 'FreqContacto',
    'NivelA_V', 'NivelA_3', 'IntensB_V', 'IntensB_3',
    'Comp_V', 'Comp_3', 'ANS_V', 'ANS_3', 'LetMax_V', 'LetMax_3',
    'Class_V', 'Class_3', 'Respostas'
  ],

  // ── M-CHAT-R/F — Despiste Precoce de Autismo ──
  // © 2009 Robins, Fein, & Barton · Tradução PT-PT: Carla Cintrão Almeida
  // 16-30 meses (em MESES, não anos) · preenchido pelos pais c/ supervisão clínica
  // Etapa 1: 20 itens Sim/Não (cálculo automático Baixo 0-2 / Moderado 3-7 / Alto 8-20)
  // Etapa 2 condicional (só score 3-7): entrevista de seguimento item-a-item
  //   → Esclarecido (Passa) / Confirmado (Falha) por item; ≥2 confirmados = positivo
  // Categorias finais: Baixo · Moderado — Negativo · Moderado — Positivo · Alto
  // Items 2, 5, 12 → "Sim" = Falha · todos os outros → "Não" = Falha
  M_CHAT_R_F: [
    'Data', 'Codigo', 'NomeCrianca', 'DataNasc', 'Idade', 'Sexo', 'DataAplicacao',
    'Avaliador', 'Contexto', 'Observacoes', 'NomeInformante', 'Relacao',
    'ScoreE1', 'ScoreE2', 'CatFinal', 'Etapa2Admin', 'ItensFalhadosE1', 'Respostas'
  ],

  // ── Família CARS2 (v70.0) ─────────────────────────────────
  // Adaptações inspiradas (Via B) na CARS-2 (Schopler, Van Bourgondien, Wellman & Love, 2010, WPS)

  CARS2_HP: [
    'Data', 'Codigo', 'NomeAvaliando', 'DataNasc', 'Idade', 'Sexo', 'DataAplicacao',
    'Psicologo', 'Contexto', 'Fontes',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
    'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15',
    'Total', 'Categoria', 'DominiosCriticos', 'NCriticos', 'Respostas'
  ],

  CARS2_QPC: [
    'Data', 'Codigo', 'NomeAvaliando', 'DataNasc', 'Idade', 'Sexo', 'DataAplicacao',
    'NomeInformante', 'Relacao', 'TempoConvivencia', 'OutrasPessoas',
    'Psicologo', 'Contexto',
    'NItensRespondidos', 'NItensPreocupantes', 'PctGlobal',
    'NDominiosSinalizados', 'DominiosSinalizados', 'Categoria',
    'pct_dom_1', 'pct_dom_2', 'pct_dom_3', 'pct_dom_4', 'pct_dom_5',
    'pct_dom_6', 'pct_dom_7', 'pct_dom_8', 'pct_dom_9', 'pct_dom_10',
    'pct_dom_11', 'pct_dom_12', 'pct_dom_13', 'pct_dom_14', 'pct_dom_15',
    'sinal_dom_1', 'sinal_dom_2', 'sinal_dom_3', 'sinal_dom_4', 'sinal_dom_5',
    'sinal_dom_6', 'sinal_dom_7', 'sinal_dom_8', 'sinal_dom_9', 'sinal_dom_10',
    'sinal_dom_11', 'sinal_dom_12', 'sinal_dom_13', 'sinal_dom_14', 'sinal_dom_15',
    'Respostas'
  ],

  CARS2_ST: [
    'Data', 'Codigo', 'NomeAvaliando', 'DataNasc', 'Idade', 'Sexo', 'DataAplicacao',
    'QIEstimado', 'NivelVerbal',
    'Psicologo', 'Contexto', 'Fontes',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
    'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15',
    'Total', 'Categoria', 'DominiosCriticos', 'NCriticos', 'Respostas'
  ],

  // ── MCP · Mapeamento de Configuração Parental (Ricardina Correia, 2026) ───
  // Instrumento clínico ad-hoc · uso orientativo · articulado com entrevista
  // Pai+mãe podem submeter em separado → dedupe por NomeInformante (Relacao como fallback)

  // MCP Breve · 4 secções (Coabitantes + Quotidiano + Autoridade + Posição parental)
  MCP_Breve: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Relacao',
    'ConfigTipo', 'TempoCoabitacao',
    'Coabitantes', 'Inicio',
    'S2_Escola', 'S2_Refeicoes', 'S2_Banho', 'S2_Adormecimento', 'S2_Noite', 'S2_Doenca',
    'S3_1', 'S3_2', 'S3_3', 'S3_4', 'S3_5', 'S3_6',
    'S4_1', 'S4_2', 'S4_3', 'S4_4',
    'Media_Autoridade', 'Media_BemEstar',
    'Respostas'
  ],

  // MCP Completo · 7 secções (Coabitantes + Quotidiano + Autoridade + Relação afetiva + Resposta dos outros + Posição parental + Síntese)
  MCP_Completo: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Relacao',
    'ConfigTipo', 'TempoCoabitacao',
    'Coabitantes', 'Inicio', 'InicioOutra', 'Futuro',
    'S2_Escola', 'S2_Refeicoes', 'S2_Banho', 'S2_Adormecimento', 'S2_Noite', 'S2_Doenca',
    'S3_1', 'S3_2', 'S3_3', 'S3_4', 'S3_5', 'S3_6', 'S3_Aberta',
    'S4_Figuras', 'S4_ProcuraMedo', 'S4_ProcuraZanga',
    'S5_1', 'S5_2', 'S5_3', 'S5_4', 'S5_5',
    'S6_1', 'S6_2', 'S6_3', 'S6_4', 'S6_Aberta',
    'S7_Funciona', 'S7_Mudar',
    'Media_Autoridade', 'Media_Acomodacao', 'Media_BemEstar',
    'Respostas'
  ],

  // ── UCLA-PTSD Adaptado · Rastreio PSPT Pediátrica (Ricardina Correia, 2026) ────
  // Adaptação inspirada (Via B) · operacionalização clínica do DSM-5-TR · 7–11 anos
  // Clinician-rated — cotação por psicólogo a partir de entrevista com a criança
  // 13 eventos (Critério A) + Evento Índice + 27 itens Likert 0-4 (B,C,D,E,Dis,I) + duração/início
  // Scores: totais por critério, itens ≥2, Total sintomático (0-80), banda, regra DSM-5-TR, padrão T1-T5
  UCLA_PTSD_Adaptado: [
    'Data', 'Código', 'NomeCriança', 'Idade', 'Sexo',
    'DataAplicacao', 'Avaliador', 'NomeInformante', 'Informante', 'Contexto',
    // Critério A — eventos
    'NEventos', 'EventosMarcados', 'EventosIdades',
    // Evento Índice
    'IndiceTipo', 'IndiceIdade', 'IndiceModalidade', 'IndiceDescricao',
    // Itens Likert 0-4
    'B1', 'B2', 'B3', 'B4', 'B5',
    'C1', 'C2',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7',
    'E1', 'E2', 'E3', 'E4', 'E5', 'E6',
    'Dis1', 'Dis2',
    'I1', 'I2', 'I3', 'I4', 'I5',
    // Duração e Início (meses)
    'DuracaoMeses', 'InicioMeses',
    // Totais por critério
    'Tot_B', 'Tot_C', 'Tot_D', 'Tot_E', 'Tot_Dis', 'Tot_I',
    // Itens ≥ 2 por critério
    'N_B_GE2', 'N_C_GE2', 'N_D_GE2', 'N_E_GE2', 'N_Dis_GE2', 'N_I_GE2',
    // Total geral e banda
    'TotalSintomatico', 'Banda',
    // Critérios DSM-5-TR (SIM/NÃO)
    'CritA', 'CritB', 'CritC', 'CritD', 'CritE', 'CritF', 'CritG',
    'CritsCumpridos', 'RegraCumprida',
    // Especificadores
    'EspDissociativo', 'EspExpressaoTardia',
    // Padrão clínico
    'PadraoTag', 'PadraoLabel', 'PadraoAcao',
    // JSON com respostas brutas (essencial p/ syncData reconstruir — Secção 28 da skill)
    'Respostas'
  ],

  // ── ISAS · Inventário de Afirmações sobre Autolesão (Klonsky & Glenn, 2009) ──
  // Auto-resposta · 12–25 anos · Sec. I (caracterização — 12 comportamentos + 7 q. contextuais) + Sec. II (39 itens Likert 0-2)
  // 13 funções (6 intrapessoais + 7 interpessoais) · Domínios Intra 0-36 / Inter 0-42 · Total 0-78
  // Cut-offs: Função 0-2 Baixa / 3-4 Média / 5-6 Alta · Total 0/1-26/27-52/53-78
  // Perfis: Baixo investimento / Intrapessoal predom. / Interpessoal predom. / Misto
  // Alertas críticos: AS (Anti-suicídio) ≥4 · AP (Auto-punição) ≥4 · IN (Influência interpessoal) ≥4
  ISAS: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Idade', 'Sexo',
    'DataAplicacao', 'Avaliador', 'Contexto',
    'Informante', 'NomeInformante',
    // Secção I — comportamentos (contagens), forma principal, idades, contexto
    'Comp_Cortar', 'Comp_Arranhar', 'Comp_Morder', 'Comp_Bater', 'Comp_Queimar',
    'Comp_Interferir', 'Comp_Esculpir', 'Comp_Esfregar', 'Comp_Beliscar',
    'Comp_Agulhas', 'Comp_Cabelos', 'Comp_Engolir',
    'Comp_Outro_Tipo', 'Comp_Outro_N',
    'FormaPrincipal', 'IdadePrimeira', 'IdadeUltima',
    'DorFisica', 'Sozinha', 'IntervaloImpulso', 'QuerParar',
    // Secção II — 39 itens Likert 0-2 (item-a-item, opcional para auditoria)
    'I01','I02','I03','I04','I05','I06','I07','I08','I09','I10',
    'I11','I12','I13','I14','I15','I16','I17','I18','I19','I20',
    'I21','I22','I23','I24','I25','I26','I27','I28','I29','I30',
    'I31','I32','I33','I34','I35','I36','I37','I38','I39',
    // Scores das 13 funções (0-6 cada) — 6 intrapessoais + 7 interpessoais
    'RA',  // Regulação do afecto      (intra)
    'AD',  // Anti-dissociação          (intra)
    'AS',  // Anti-suicídio             (intra)
    'MS',  // Marcar sofrimento         (intra)
    'AP',  // Auto-punição              (intra)
    'EN',  // Endurecimento             (intra)
    'AU',  // Autonomia                 (inter)
    'LI',  // Limites interpessoais     (inter)
    'IN',  // Influência interpessoal   (inter)
    'VP',  // Vinculação a pares        (inter)
    'VG',  // Vingança                  (inter)
    'AC',  // Auto-cuidado              (inter)
    'PS',  // Procura de sensações      (inter)
    // Domínios e perfil
    'Intrapessoal', 'Interpessoal', 'Total', 'PerfilFuncional',
    // Top 3 funções (códigos ordenados por intensidade)
    'Top1', 'Top2', 'Top3',
    // Alertas críticos (níveis: '', 'medio', 'alto')
    'AlertaAS', 'AlertaAP', 'AlertaIN',
    // JSON com respostas brutas (essencial p/ syncData reconstruir — Secção 28 da skill)
    'Respostas'
  ],

  // ── FAMÍLIA FASA (Ansiedade · Lebowitz et al.) v71.0 ──────────────────────────
  // Escala de Acomodação Familiar a Sintomas de Ansiedade — adaptação Via B PT-EU
  // 3 versões: Parental (13 itens), CR Infância 7-10 (16 itens), CR Adolescência 11-17 (16 itens)
  // Subescalas: PAR (Participação) + MOD (Modificação) + SOF (item único) + CON (3 itens)
  // CR adicionam Bloco D — Crenças: UP (Utilidade), DC (Desejo Continuidade), AENA (Autoeficácia)
  // IRC = UP + DC + (4 − AENA), amplitude 0-12 — Índice Reliance Cognitivo

  // FASA Parental — 13 itens · pais/cuidadores
  FASA_Parental: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Relação', 'Idade', 'Sexo',
    'PAR', 'MOD', 'Total', 'MediaItem', 'SOF', 'RC', 'CMO',
    'Respostas'
  ],

  // FASA CR Infância (autorrelato 7-10) — 16 itens (inclui Bloco D crenças)
  FASA_CR_Infancia: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Acompanhamento', 'Idade', 'Sexo',
    'PAR', 'MOD', 'Total', 'MediaItem', 'SOF', 'RC', 'CMO',
    'UP', 'DC', 'AENA', 'IRC',
    'Respostas'
  ],

  // FASA CR Adolescência (autorrelato 11-17) — 16 itens (Contexto em vez de Acompanhamento)
  FASA_CR_Adolescencia: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Contexto', 'Idade', 'Sexo',
    'PAR', 'MOD', 'Total', 'MediaItem', 'SOF', 'RC', 'CMO',
    'UP', 'DC', 'AENA', 'IRC',
    'Respostas'
  ],

  // ── FAMÍLIA FAS (TOC pediátrico · Calvocoressi/Flessner) v71.0 ─────────────────
  // Escala de Acomodação Familiar em TOC — adaptação Via B PT-EU
  // Estrutura: Bloco A (checklist 16 cat. dicotómicas TOC: 8 OBS + 8 COMP) +
  //            Bloco B+C (acomodação: PAR 5 itens 0-20 + MOD 4 itens 0-16 + SOF + CON)
  // CR adicionam Bloco D — Crenças (UP/DC/AENA) e IRC
  // Indicadores específicos TOC: Obs/Comp/DS/DOC/RAS (Razão Acomodação/Sintoma = Total ÷ DS)
  // Alertas: CMO ≥ 3 · RAS > 8 (hiperconcentração) · IRC ≥ 9 (dependência cognitiva)

  // FAS Parental — checklist + 13 itens · pais/cuidadores
  FAS_Parental: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Relação', 'Idade', 'Sexo',
    'Obs', 'Comp', 'DS', 'DOC',
    'PAR', 'MOD', 'Total', 'MediaItem', 'SOF', 'RC', 'CMO',
    'RAS', 'Categorias',
    'Checklist', 'Respostas'
  ],

  // FAS CR Infância (autorrelato 7-10) — checklist + 16 itens (inclui Bloco D)
  FAS_CR_Infancia: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Acompanhamento', 'Idade', 'Sexo',
    'Obs', 'Comp', 'DS', 'DOC',
    'PAR', 'MOD', 'Total', 'MediaItem', 'SOF', 'RC', 'CMO',
    'RAS', 'Categorias',
    'UP', 'DC', 'AENA', 'IRC',
    'Checklist', 'Respostas'
  ],

  // FAS CR Adolescência (autorrelato 11-17) — checklist + 16 itens (Contexto)
  FAS_CR_Adolescencia: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Contexto', 'Idade', 'Sexo',
    'Obs', 'Comp', 'DS', 'DOC',
    'PAR', 'MOD', 'Total', 'MediaItem', 'SOF', 'RC', 'CMO',
    'RAS', 'Categorias',
    'UP', 'DC', 'AENA', 'IRC',
    'Checklist', 'Respostas'
  ],

  // RSES — Escala de Auto-Estima de Rosenberg (autorrelato adolescentes 12-20, Pechorro et al. 2011) — v72.0
  RSES: [
    'Data', 'Código', 'NomeJovem', 'Idade', 'Sexo', 'Contexto', 'NomeRespondente',
    'Total', 'Zscore', 'Percentil', 'Classificacao', 'Grupo', 'Respostas'
  ],

  // RBS-R — Escala de Comportamentos Repetitivos, Revista (heteroavaliação; Bodfish et al. 2000) — v73.0
  // Pontuação por subescala/total: N = nº comportamentos (itens ≥1) · P = pontuação (soma severidades 0-3)
  RBS_R: [
    'Data', 'Código', 'NomeCrianca', 'NomeInformante', 'Informante', 'Idade',
    'EST_N', 'EST_P', 'AUT_N', 'AUT_P', 'COM_N', 'COM_P', 'RIT_N', 'RIT_P',
    'SIM_N', 'SIM_P', 'RES_N', 'RES_P', 'TOT_N', 'TOT_P', 'Respostas'
  ],

  PSI4_adap: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Idade', 'Sexo',
    'MP', 'ID', 'CD', 'TOTAL', 'RD',
    'POMP_MP', 'POMP_ID', 'POMP_CD', 'POMP_TOTAL', 'Sentinela', 'Respostas'
  ],

  // FACES-IV adap — Coesão e Flexibilidade Familiar (adaptação inspirada; Modelo Circumplexo, Olson) — v74.0
  // 6 escalas de 7 itens (CE/FE equilibradas; DES/EMA/RIG/CAO desequilibradas). POMP = (bruto-7)/28*100.
  // Rácios descritivos (não normativos): Coesao = CE/((DES+EMA)/2); Flex = FE/((RIG+CAO)/2); Total = média.
  FACES_IV_adap: [
    'Data', 'Código', 'NomeCriança', 'NomeRespondente', 'Relação', 'Idade',
    'CE', 'FE', 'DES', 'EMA', 'RIG', 'CAO',
    'POMP_CE', 'POMP_FE', 'POMP_DES', 'POMP_EMA', 'POMP_RIG', 'POMP_CAO',
    'Racio_Coesao', 'Racio_Flex', 'Racio_Total', 'Classificacao',
    'Pos_Coesao', 'Pos_Flex', 'Respostas'
  ],

  // CABS — Escala de Comportamento Assertivo para Crianças (Michelson & Wood, 1982) — v75.0
  // Pontuação por opção: −2 muito passiva · −1 passiva · 0 assertiva · +1 agressiva · +2 muito agressiva
  // NA_Total = Σ|pontos| (0-54) · Passivo = |Σ negativos| · Agressivo = Σ positivos · Assertivo = nº respostas 0
  CABS_Auto: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante', 'Idade',
    'NA_Total', 'Passivo', 'Agressivo', 'Assertivo',
    'Class_Total', 'Class_Passivo', 'Class_Agressivo', 'Respostas'
  ],

  CABS_Hetero: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante', 'Idade',
    'NA_Total', 'Passivo', 'Agressivo', 'Assertivo',
    'Class_Total', 'Class_Passivo', 'Class_Agressivo', 'Respostas'
  ],

  // SPPA — «Como é que eu sou?» + Escala de Importância (Harter, 1988/2012; bateria única) — v76.0
  // Competência: médias 1-4 por subescala (5 itens; pró-rateamento ≥4/5); AEG = dimensão própria.
  // Importância: médias 1-4 por área (2 itens; valorizada ≥3). Respostas = 61 posições (45 Parte I + 16 Parte II).
  SPPA: [
    'Data', 'Código', 'NomeJovem', 'Informante', 'NomeInformante', 'Idade', 'Sexo', 'AnoEsc',
    'M_Escolar', 'M_Social', 'M_Atletica', 'M_AparenciaFisica', 'M_Laboral',
    'M_Romantica', 'M_Comportamento', 'M_AmizadesIntimas', 'M_AutoestimaGlobal',
    'IMP_Escolar', 'IMP_Social', 'IMP_Atletica', 'IMP_AparenciaFisica', 'IMP_Laboral',
    'IMP_Romantica', 'IMP_Comportamento', 'IMP_AmizadesIntimas',
    'NAreasValorizadas', 'AreasVulneraveis', 'AnoUS', 'Respostas'
  ],

  // SPPC — «Como é que eu sou» + «Que importância isto tem para mim?» (Harter, 2012; bateria única crianças) — v77.0
  // Competência: médias 1-4 por subescala (6 itens; pró-rateamento ≥4/6); AEG = dimensão própria.
  // Importância: médias 1-4 por área (2 itens; valorizada ≥3). Respostas = 46 posições (36 Parte I + 10 Parte II).
  SPPC: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante', 'Idade', 'Sexo', 'AnoEsc',
    'M_Escolar', 'M_Social', 'M_Desportiva', 'M_AparenciaFisica', 'M_Comportamental', 'M_AutoestimaGlobal',
    'IMP_Escolar', 'IMP_Social', 'IMP_Desportiva', 'IMP_AparenciaFisica', 'IMP_Comportamental',
    'NAreasValorizadas', 'AreasVulneraveis', 'Respostas'
  ],

  // SPPC_Professor — Escala de Avaliação do Professor (paralela ao SPPC; Harter 2012) — v77.0
  // 5 domínios × 3 itens (média 1-4; pró-rateamento ≥2/3); sem AEG nem normas. Respostas = 15 posições.
  SPPC_Professor: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante', 'AnoEsc',
    'P_Escolar', 'P_Social', 'P_Desportiva', 'P_AparenciaFisica', 'P_Comportamental', 'Respostas'
  ],

  // SPPLD — «Como Eu Sou» + «Com Quem Me Comparei» + Importância (Renick & Harter, 1988/2012; bateria única DAE) — v78.0
  // 10 subescalas (médias 1-4; máx. 1 omisso): 5 escolares (CIG, Leitura, Escrita, Ortografia, Matemática) + Atlética,
  // Social, Aparência Física, Conduta + Autoestima Global (dimensão própria). Sem normas — bandas descritivas do manual.
  // Discrepâncias James só em domínios com importância ≥3,0. Respostas = 64 posições (46 + 18); GruposComparacao = 9 (1/2).
  SPPLD: [
    'Data', 'Código', 'NomeAluno', 'Informante', 'NomeInformante', 'Idade', 'Sexo', 'AnoEsc',
    'M_CIG', 'M_Leitura', 'M_Escrita', 'M_Ortografia', 'M_Matematica',
    'M_Atletica', 'M_Social', 'M_AparenciaFisica', 'M_Conduta', 'M_AutoestimaGlobal',
    'IMP_CIG', 'IMP_Leitura', 'IMP_Escrita', 'IMP_Ortografia', 'IMP_Matematica',
    'IMP_Atletica', 'IMP_Social', 'IMP_AparenciaFisica', 'IMP_Conduta',
    'NDominiosImportantes', 'DiscrepanciaMedia', 'DominiosVulneraveis', 'GruposComparacao', 'Respostas'
  ],

  // SPPCS — Self-Perception Profile for College Students (Neemann & Harter, 2012; bateria única ensino superior) — v79.0
  // Autoperceção: médias 1-4 por subescala (4 itens; AEG = 6 itens). Importância: médias 1-4 por área (2 itens).
  // Apoio Social: médias 1-4 por fonte (4 itens). Discrepância James/Harter só em domínios com importância = 4.
  // Respostas = 98 posições (54 «Como Eu Sou» + 24 Importância + 20 «As Pessoas na Minha Vida»). Sem normas PT.
  SPPCS: [
    'Data', 'Código', 'NomeEstudante', 'Idade', 'Sexo', 'CursoAno', 'Informante', 'NomeInformante',
    'AP_CT', 'AP_CESC', 'AP_AS', 'AP_APF', 'AP_RP', 'AP_AI', 'AP_CI', 'AP_MO', 'AP_RA', 'AP_HU', 'AP_CRI', 'AP_CA', 'AP_AEG',
    'IMP_CT', 'IMP_CESC', 'IMP_AS', 'IMP_APF', 'IMP_RP', 'IMP_AI', 'IMP_CI', 'IMP_MO', 'IMP_RA', 'IMP_HU', 'IMP_CRI', 'IMP_CA',
    'SS_AmigoIntimo', 'SS_Mae', 'SS_Pai', 'SS_Professores', 'SS_OrgAcademicas',
    'NDominios4', 'DiscrepGlobal', 'Respostas'
  ],

  // EPCAS-PE — Escala Pictórica de Competência Percebida e Aceitação Social, Forma Pré-Escolar (Harter & Pike, 1983/1984) — v80.0
  // Administração individual pelo examinador (4-7 anos). 30 itens (24 originais + 6 Aparência Física, ilustrações Eklund).
  // Cotação 1-4 por item; somas (6-24) e médias (1-4) por subescala; fatores CG (COG+FIS) e AS (PAR+PRT) ao nível do item.
  // Bandas DESCRITIVAS (sem normas PT): <2,00 Baixa · 2,00-2,99 Média · >=3,00 Elevada.
  EPCAS_PE: [
    'Data', 'Código', 'NomeCriança', 'Género', 'Idade', 'Sala', 'Educador',
    'Informante', 'NomeInformante',
    'COG_Soma', 'COG_Med', 'FIS_Soma', 'FIS_Med', 'PAR_Soma', 'PAR_Med',
    'PRT_Soma', 'PRT_Med', 'APF_Soma', 'APF_Med', 'CG_Med', 'AS_Med',
    'Observações', 'Respostas'
  ],

  // DIÁRIO DE EPISÓDIOS — Monitorização inter-sessões (Ricardina Correia, 2026) — v81.0
  // Instrumento QUALITATIVO (sem cotação normativa): registo doméstico de episódios entre sessões.
  // Coluna 'Episodios' guarda o array completo em JSON; resumo em FrequenciaCategorias/DistribuicaoIntensidade.
  // ── Diário de Episódios — MODELO POR EPISÓDIO (v90.0): 1 linha = 1 episódio ──
  // Cada registo dos pais no HTML gera uma linha; o painel clínico acumula-as.
  DIARIO_EPISODIOS: [
    'Data', 'Hora', 'Código', 'NomeCriança', 'Informante', 'NomeInformante',
    'Intensidade', 'Categorias', 'OQueAconteceu', 'RespostaCriança', 'RespostaCuidadores',
    'EpisodioID', 'Timestamp', 'Respostas'
  ],

  // ANAMNESE PARENTAL COMPLEMENTAR — Recolha da perspetiva do progenitor (Ricardina Correia, 2026)
  // Instrumento QUALITATIVO (sem cotação normativa): perspetiva do progenitor/cuidador ausente na anamnese inicial.
  // Coluna 'Respostas' guarda o objeto qualitativo completo em JSON para reconstrução no painel.
  ANAMNESE_PARENTAL_COMPLEMENTAR: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante', 'Contacto',
    'Motivacao', 'PreocupacaoPrincipal', 'Areas',
    'Rotinas', 'CorreBem', 'MaisDificil',
    'EvolPositiva', 'EvolPreocupante', 'InfoAdicional',
    'Expectativas', 'Disponibilidade', 'DisponibDetalhe',
    'Respostas', 'Timestamp'
  ],

  // MABC-2 LISTA DE VERIFICAÇÃO — Movement ABC-2 Checklist (Henderson, Sugden & Barnett) — v80.0
  // Heteroavaliação do movimento (5–12 anos): Secção A (estático/previsível) + B (dinâmico/imprevisível) + C (fatores não motores).
  // Coluna 'Respostas' guarda as 43 respostas brutas em JSON para reconstrução no painel.
  MABC2_Checklist: [
    'Data', 'Código', 'NomeCrianca', 'Idade', 'AnoEscolaridade',
    'Informante', 'NomeInformante', 'Relação',
    'SubtotalA', 'SubtotalB', 'TotalMotor', 'SimC', 'Flags', 'Respostas'
  ],

  // ── SNAP-IV (Versão Reduzida DSM-IV) · Swanson et al. (2000, 2012) · Versão PT: Octávio Moura ──
  SNAP_IV: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante',
    'Idade', 'Sexo', 'Ano',
    'DESAT_TOTAL', 'DESAT_N', 'DESAT_MEDIA',
    'HI_TOTAL', 'HI_N', 'HI_MEDIA',
    'COMB_TOTAL', 'COMB_N', 'COMB_MEDIA',
    'Respostas'
  ],

  // ── GAI — Grelha de Automonitorização Interocetiva · Ricardina Correia (2026) · instrumento ad-hoc ──
  GAI: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Informante', 'NomeInformante',
    'EIXO_SOMATICO', 'EIXO_APETITIVO', 'ALERTAS', 'MARCADORES_NUTRICIONAIS', 'OUTRA_COISA',
    'Respostas'
  ],

  // ── CSHQ-PT (Pais) — Children's Sleep Habits Questionnaire · Silva et al. (2013) · 33 itens, 8 subescalas + IPS ──
  // Invertidos 1,3,10,11,26. IPS ≥ 48 = rastreio positivo (validação PT). Coluna 'Respostas' guarda as 33 respostas em JSON.
  CSHQ_PT_Pais: [
    'Data', 'Código', 'NomeCriança', 'Sexo', 'Idade', 'NomeInformante', 'Relacao',
    'Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5', 'Sub6', 'Sub7', 'Sub8',
    'IPS', 'Rastreio', 'Respostas'
  ],

  // ── SSR-PT — Sleep Self-Report (auto-relato) · Owens et al. (2000) · 7-12 anos · itens cotados 4-26 ──
  // Invertidos 6,11,26. Cut-off Total > 41. Colunas gerais (não cotadas): RegrasSono/ProblemasSono/GostaDormir.
  SSR_PT: [
    'Data', 'Código', 'NomeJovem', 'AnoEscolaridade', 'NomeInformante', 'Relacao',
    'RegrasSono', 'ProblemasSono', 'GostaDormir',
    'RD', 'IS', 'DS', 'AS', 'DN', 'PA', 'SD', 'Total', 'RastreioTotal', 'Respostas'
  ],

  // ── TS-OC Parte I — YGTSS (Yale Global Tic Severity Scale; Leckman et al., 1989) · reformatação PT-PT ──
  // Gravidade de tiques com dupla janela temporal: 'Atual' (últimos 7 dias) e 'Pior' (pior fase). Global 0–100.
  TSOC_YGTSS: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Idade', 'Timestamp',
    'SubtotalMotor_Atual', 'SubtotalFonico_Atual', 'TotalTiques_Atual', 'Comprometimento_Atual',
    'IndiceComp_Atual', 'Global_Atual', 'Banda_Atual', 'Predominio_Atual', 'Proporcionalidade_Atual',
    'SubtotalMotor_Pior', 'SubtotalFonico_Pior', 'TotalTiques_Pior', 'Comprometimento_Pior',
    'IndiceComp_Pior', 'Global_Pior', 'Banda_Pior',
    'Respostas'
  ],

  // ── A-DES — Escala de Experiências Dissociativas em Adolescentes · Putnam et al. (1997) · auto-relato, 30 itens (0–10) ──
  // Média global + 5 domínios (Amnésia, DP/DR, Absorção, Identidade, Transversal). Cut-off orientador 4.0. 'Respostas' guarda os 30 itens em JSON.
  A_DES: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Idade',
    'MediaGlobal', 'Amnesia', 'DPDR', 'Absorcao', 'Identidade', 'Transversal',
    'Classificacao', 'Respostas'
  ],

  // ── Entrevista adaptada CAARMS · Avaliação Fenomenológica de Experiências Psicóticas Atenuadas, Dissociação e Funcionamento Subjetivo (Ricardina Correia, 2026) ──
  // Entrevista semiestruturada aplicada pela clínica (10 domínios). Orientadora/descritiva — não diagnóstica.
  // IGAD (média dos 10 índices) + IGAD_Bruto (soma/54*100) + Soma_Total + banda. Índices e somas por domínio (D1–D10).
  // 'Respostas' guarda respostas estruturadas + fluidas + observações em JSON.
  CAARMS_ADAP: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante', 'Idade',
    'IGAD', 'IGAD_Bruto', 'Soma_Total', 'Banda_IGAD',
    'D1_Idx', 'D2_Idx', 'D3_Idx', 'D4_Idx', 'D5_Idx',
    'D6_Idx', 'D7_Idx', 'D8_Idx', 'D9_Idx', 'D10_Idx',
    'D1_Soma', 'D2_Soma', 'D3_Soma', 'D4_Soma', 'D5_Soma',
    'D6_Soma', 'D7_Soma', 'D8_Soma', 'D9_Soma', 'D10_Soma',
    'Sinalizadores', 'Respostas'
  ],

  // ── Prova «O Cuidar e a Integridade do Corpo» · story-stems abertos (Ricardina Correia, 2026) ──
  // Prova projetiva idiográfica aplicada pela psicóloga (idade escolar ≈6–11). Não-normativa, leitura descritiva (não cotação).
  // 4 eixos: AX1 Integridade corporal, AX2 Cuidado e dependência, AX3 Coping/resolução (predominante+secundário), AX4 Figuras cuidadoras (+ reparação relacional).
  // Posições 1–5 (1 adaptativo → 5 vulnerabilidade). 'Respostas' guarda temas, eixos, interpretação, síntese e leitura descritiva em JSON.
  CUIDAR_CORPO: [
    'Data', 'Código', 'NomeCriança', 'Informante', 'NomeInformante', 'Idade',
    'AX1_Pos', 'AX2_Pos', 'AX3_Pred', 'AX3_Sec', 'AX4_Pos', 'Reparacao',
    'PerfilResumo', 'Respostas'
  ],

  // ── CSAS · Escala de Ansiedade de Separação para Crianças — autorrelato (Méndez et al., 2014) ──
  //   20 itens, 4 fatores de 5 itens. Calma invertida no cálculo (itens 3,8,12,15,19). Corte total ≥68 (orientativo, norma ESP).
  CSAS: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Informante', 'Idade', 'Sexo',
    'Preocupacao', 'Malestar', 'Oposicao', 'Calma', 'Total', 'Classificação', 'Respostas'
  ],

  // ── CSAS-P · Escala de Ansiedade de Separação para Crianças — Versão Pais (Méndez et al., 2022) ──
  //   20 itens, 4 fatores. Calma directa (fator positivo/protetor); Total = Preoc+Opos+Mal+(30−Calma). Sem ponto de corte. Norma parental ESP.
  CSAS_P: [
    'Data', 'Código', 'NomeCriança', 'NomeInformante', 'Relação', 'Idade', 'Sexo',
    'Preocupacao', 'Oposicao', 'Calma', 'Malestar', 'Total', 'Respostas'
  ],

  // ── SGRS · Sohn Grayson Rating Scale (Sohn & Grayson, 2005) — v91.0 ──
  //   58 itens · 6 domínios · Likert 1–4 · SEM itens invertidos · amplitude 58–232.
  //   Domínios: S=Comportamento Social (14) · C=Comportamento (8) · L=Discurso e Linguagem (22)
  //             G=Cognição (7) · P=Perceção Sensorial (5) · M=Comportamento Motor (2).
  //   Total bruto só é válido com 58/58 itens; com omissos usa-se estimativa prorrateada (média/item × 58).
  //   Sem normas portuguesas — bandas globais dos autores; classificação por domínio meramente descritiva.
  //   ⚠ Formatar S_Media..M_Idx como TEXTO SIMPLES no Sheet (evita coerção pt-PT de "2,29" para data).
  SGRS: [
    'Data', 'Código', 'NomeCriança', 'DataNasc', 'Idade', 'NomeInformante', 'Relação', 'LocalExame',
    'Respondidos', 'Omissos',
    'S_Soma', 'S_Media', 'S_Idx', 'C_Soma', 'C_Media', 'C_Idx', 'L_Soma', 'L_Media', 'L_Idx',
    'G_Soma', 'G_Media', 'G_Idx', 'P_Soma', 'P_Media', 'P_Idx', 'M_Soma', 'M_Media', 'M_Idx',
    'Total_Bruto', 'Total_Prorrateado', 'Pontuacao_Utilizada', 'Base_Cotacao', 'Banda',
    'N_Sinalizados', 'Respostas'
  ],

};


// ── MAPEAMENTO: instrumento → aba ────────────────────────────
var ABA = {
  // ── Família EIF · Escalas de Interferência Funcional (v121.0) ──
  'EIFP':              'EIFP',
  'eifp':              'EIFP',
  'EIFP_C':            'EIFP',
  'EIFP_P':            'EIFP',
  'EIFP_v1':           'EIFP',
  'EIFA':              'EIFA',
  'eifa':              'EIFA',
  'EIFA_A':            'EIFA',
  'EIFA_S':            'EIFA',
  'EIFA_v1':           'EIFA',
  'EIFJ':              'EIFJ',
  'eifj':              'EIFJ',
  'EIFJ_J':            'EIFJ',
  'EIFJ_S':            'EIFJ',
  'EIFJ_v1':           'EIFJ',
  // ── CAARS · Conners' Adult ADHD Rating Scales (v120.0) ──
  // Dois ficheiros HTML publicados, um por forma, para DUAS abas: cada ligação é
  // enviada ao respondente já com a forma correcta, sem escolha no ecrã.
  'CAARS_SL':          'CAARS_SL',
  'caars_sl':          'CAARS_SL',
  'CAARS-S:L':         'CAARS_SL',
  'CAARS_SL_v1':       'CAARS_SL',
  'CAARS_OL':          'CAARS_OL',
  'caars_ol':          'CAARS_OL',
  'CAARS-O:L':         'CAARS_OL',
  'CAARS_OL_v1':       'CAARS_OL',
  // ── EII-PT · Escala de Intolerância à Incerteza (v119.0) ──
  // Quatro ficheiros HTML publicados (2 versões × 2 formas) para DUAS abas: cada
  // ligação é enviada ao respondente já com a forma correcta, sem escolha no ecrã.
  'EII27':             'EII27',
  'eii27':             'EII27',
  'EII-27':            'EII27',
  'EII27_A':           'EII27',
  'EII27_J':           'EII27',
  'EII27_A_v1':        'EII27',
  'EII27_J_v1':        'EII27',
  'EII_PT_27':         'EII27',
  'EII12':             'EII12',
  'eii12':             'EII12',
  'EII-12':            'EII12',
  'EII12_A':           'EII12',
  'EII12_J':           'EII12',
  'EII12_A_v1':        'EII12',
  'EII12_J_v1':        'EII12',
  'EII_PT_12':         'EII12',
  // ── PSWQ · Penn State Worry Questionnaire (v115.0) ──
  'PSWQ':              'PSWQ',
  'pswq':              'PSWQ',
  'PSWQ_v1':           'PSWQ',
  'PSWQ-16':           'PSWQ',
  'PennStateWorry':    'PSWQ',
  // ── Escalas de Beck (v114.0) — abas SEPARADAS ──
  // BAI e BDI-II medem construtos distintos, com limiares distintos, e podem ser
  // aplicados isoladamente. Partilhar aba impediria filtrar por instrumento.
  'BAI':               'BAI',
  'bai':               'BAI',
  'BAI_v1':            'BAI',
  'Beck_BAI':          'BAI',
  'BDI2':              'BDI2',
  'bdi2':              'BDI2',
  'BDI-II':            'BDI2',
  'BDI_II':            'BDI2',
  'bdi_ii':            'BDI2',
  'BDI2_v1':           'BDI2',
  'Beck_BDI2':         'BDI2',
  // ── SIAS · SPS · Escalas de Ansiedade Social (v113.0) ──
  // As duas escalas partilham a mesma aba: são sempre aplicadas em conjunto e o
  // resultado principal é o contraste entre elas.
  'SIAS_SPS':          'SIAS_SPS',
  'sias_sps':          'SIAS_SPS',
  'SIAS-SPS':          'SIAS_SPS',
  'SIAS_SPS_v1':       'SIAS_SPS',
  'SIASSPS':           'SIAS_SPS',
  'siassps':           'SIAS_SPS',
  'SIAS':              'SIAS_SPS',
  'sias':              'SIAS_SPS',
  'SPS':               'SIAS_SPS',
  'sps':               'SIAS_SPS',
  // ── GCSA · Grelha de Caracterização da Seletividade Alimentar (v111.0) ──
  'GCSA':              'GCSA',
  'gcsa':              'GCSA',
  'GCSA_v1':           'GCSA',
  'GCSA_Grelha':       'GCSA',
  'GCSA_Pais':         'GCSA',
  'GCSA_Diario':       'GCSA_Diario',
  'gcsa_diario':       'GCSA_Diario',
  'GCSA_Diário':       'GCSA_Diario',
  'gcsa_diário':       'GCSA_Diario',
  'GCSADiario':        'GCSA_Diario',
  'gcsadiario':        'GCSA_Diario',
  'GCSA_Diario_v1':    'GCSA_Diario',
  'GCSA_Diario_7dias': 'GCSA_Diario',
  'GCSA_Diario_Pais':  'GCSA_Diario',
  // ── CAPS · Escala de Perfecionismo de Crianças e Adolescentes (v109.0) ──
  'PDRA9_C':           'PDRA9_C',
  'pdra9_c':           'PDRA9_C',
  'PDRA9C':            'PDRA9_C',
  'pdra9c':            'PDRA9_C',
  'PDRA-9/C':          'PDRA9_C',
  'PDRA9_C_v1':        'PDRA9_C',
  'PDRA9_Crianca':     'PDRA9_C',
  'PDRA9_Criança':     'PDRA9_C',
  'PDRA9_P':           'PDRA9_P',
  'pdra9_p':           'PDRA9_P',
  'PDRA9P':            'PDRA9_P',
  'pdra9p':            'PDRA9_P',
  'PDRA-9/P':          'PDRA9_P',
  'PDRA9_P_v1':        'PDRA9_P',
  'PDRA9_Pais':        'PDRA9_P',
  'PDRA9_Parental':    'PDRA9_P',
  'CAPS22':            'CAPS22',
  'caps22':            'CAPS22',
  'CAPS_22':           'CAPS22',
  'caps_22':           'CAPS22',
  'CAPS-22':           'CAPS22',
  'caps-22':           'CAPS22',
  'CAPS22_Crianca':    'CAPS22',
  'CAPS_PR':           'CAPS_PR',
  'caps_pr':           'CAPS_PR',
  'CAPSPR':            'CAPS_PR',
  'capspr':            'CAPS_PR',
  'CAPS-PR':           'CAPS_PR',
  'caps-pr':           'CAPS_PR',
  'CAPS_PR_Pais':      'CAPS_PR',
  // ── QCF-P · Questionário de Comportamento Fraterno, versão parental (v108.0) ──
  'QCFP':              'QCFP',
  'qcfp':              'QCFP',
  'QCF_P':             'QCFP',
  'qcf_p':             'QCFP',
  'QCF-P':             'QCFP',
  'qcf-p':             'QCFP',
  'QCFP_v1':           'QCFP',
  'QCF_P_Parental':    'QCFP',
  // ── QRF-C · Questionário de Relação Fraterna, versão criança (v107.0) ──
  'QRFC':              'QRFC',
  'qrfc':              'QRFC',
  'QRF_C':             'QRFC',
  'qrf_c':             'QRFC',
  'QRF-C':             'QRFC',
  'qrf-c':             'QRFC',
  'QRFC_v1':           'QRFC',
  'QRF_C_Crianca':     'QRFC',
  // ── CBQ-SF · Children's Behavior Questionnaire, Forma Breve (v106.0) ──
  'CBQ_SF':            'CBQ_SF',
  'cbq_sf':            'CBQ_SF',
  'CBQSF':             'CBQ_SF',
  'cbqsf':             'CBQ_SF',
  'CBQ-SF':            'CBQ_SF',
  'CBQ':               'CBQ_SF',
  'cbq':               'CBQ_SF',
  'CBQ_SF_v1':         'CBQ_SF',
  // ── QCVE-P · Comportamento Verbal em Contexto Escolar — Professor (v105.0) ──
  'QCVEP_PROF':        'QCVEP_PROF',
  'qcvep_prof':        'QCVEP_PROF',
  'QCVEP':             'QCVEP_PROF',
  'qcvep':             'QCVEP_PROF',
  'QCVE_P':            'QCVEP_PROF',
  'QCVE-P':            'QCVEP_PROF',
  'QCVEP_Prof_v1':     'QCVEP_PROF',
  'QCVEP_Professores': 'QCVEP_PROF',
  // ── SMQ · Questionário de Mutismo Seletivo (v104.0) ──
  'SMQ_Pais':          'SMQ_Pais',
  'smq_pais':          'SMQ_Pais',
  'SMQ_PAIS':          'SMQ_Pais',
  'SMQ-Pais':          'SMQ_Pais',
  'SMQ_Pais_v1':       'SMQ_Pais',
  'SMQPais':           'SMQ_Pais',
  'SMQ_Prof':          'SMQ_Prof',
  'smq_prof':          'SMQ_Prof',
  'SMQ_PROF':          'SMQ_Prof',
  'SMQ_Professores':   'SMQ_Prof',
  'smq_professores':   'SMQ_Prof',
  'SMQ_Professores_v1':'SMQ_Prof',
  // ── GAD-7 · Escala de Ansiedade Generalizada (v93.0) ──
  'GAD7':              'GAD7',
  'gad7':              'GAD7',
  'GAD_7':             'GAD7',
  'gad_7':             'GAD7',
  'GAD-7':             'GAD7',
  'GAD7_v1':           'GAD7',
  // ── AIS-8 · Escala de Insónia de Atenas (v92.0) ──
  'AIS_8':             'AIS_8',
  'ais_8':             'AIS_8',
  'AIS8':              'AIS_8',
  'ais8':              'AIS_8',
  'AIS':               'AIS_8',
  'AIS_8_v1':          'AIS_8',
  // ── ESS · Escala de Sonolência de Epworth (v117.0) ──
  'ESS_Epworth':       'ESS_Epworth',
  'ess_epworth':       'ESS_Epworth',
  'ESS':               'ESS_Epworth',
  'ess':               'ESS_Epworth',
  'Epworth':           'ESS_Epworth',
  'ESS_Epworth_v1':    'ESS_Epworth',
  // ── STOP-BANG · Rastreio de risco de SAOS (v118.0) ──
  'STOPBANG':          'STOPBANG',
  'stopbang':          'STOPBANG',
  'STOP_BANG':         'STOPBANG',
  'STOP-BANG':         'STOPBANG',
  'StopBang':          'STOPBANG',
  'STOPBANG_v1':       'STOPBANG',
  // ── SGRS · Sohn Grayson Rating Scale (v91.0) ──
  'SGRS':              'SGRS',
  'sgrs':              'SGRS',
  'SGRS_v1':           'SGRS',
  'Sohn_Grayson':      'SGRS',
  'SohnGrayson':       'SGRS',
  'Sohn-Grayson':      'SGRS',
  'ACE_Q_ADOLESCENTE': 'ACE_Q_ADOLESCENTE',
  'ace_q_adolescente': 'ACE_Q_ADOLESCENTE',
  'ACEQ_ADOLESCENTE':  'ACE_Q_ADOLESCENTE',
  'ACE-Q_Adolescente': 'ACE_Q_ADOLESCENTE',
  'ACE_Q_CUIDADOR':    'ACE_Q_CUIDADOR',
  'ace_q_cuidador':    'ACE_Q_CUIDADOR',
  'ACEQ_CUIDADOR':     'ACE_Q_CUIDADOR',
  'ACE-Q_Cuidador':    'ACE_Q_CUIDADOR',
  'MABC2_Checklist':  'MABC2_Checklist',
  'mabc2_checklist':  'MABC2_Checklist',
  'MABC2':            'MABC2_Checklist',
  'MABC-2':           'MABC2_Checklist',
  'MABC_2_Checklist': 'MABC2_Checklist',
  'MABC2_LV':         'MABC2_Checklist',
  'SNAP_IV':          'SNAP_IV',
  'snapiv':           'SNAP_IV',
  'SNAP-IV':          'SNAP_IV',
  'SNAPIV':           'SNAP_IV',
  'SNAP4':            'SNAP_IV',
  'GAI':              'GAI',
  'gai':              'GAI',
  'GAI_Interocetiva': 'GAI',
  'GAI_Jovem':        'GAI',
  'CSHQ_PT_Pais':     'CSHQ_PT_Pais',
  'cshq_pt_pais':     'CSHQ_PT_Pais',
  'CSHQ_PT':          'CSHQ_PT_Pais',
  'CSHQ-PT':          'CSHQ_PT_Pais',
  'CSHQ':             'CSHQ_PT_Pais',
  'SSR_PT':           'SSR_PT',
  'ssr_pt':           'SSR_PT',
  'SSR-PT':           'SSR_PT',
  'SSR':              'SSR_PT',
  'TSOC_YGTSS':       'TSOC_YGTSS',
  'tsoc_ygtss':       'TSOC_YGTSS',
  'TSOC-YGTSS':       'TSOC_YGTSS',
  'YGTSS':            'TSOC_YGTSS',
  'ygtss':            'TSOC_YGTSS',
  'A_DES':            'A_DES',
  'a_des':            'A_DES',
  'A-DES':            'A_DES',
  'ADES':             'A_DES',
  'ades':             'A_DES',
  'TAS20':        'TAS20',
  'TAS-20':       'TAS20',
  'CBCL_618':     'CBCL_618',
  'CBCL':         'CBCL_618',
  'TRF_618':      'TRF_618',
  'TRF':          'TRF_618',
  'YSR_1118':     'YSR_1118',
  'YSR':          'YSR_1118',
  'CBCL_15':      'CBCL_15',
  'CBCL15':       'CBCL_15',
  'CTRF_15':      'CTRF_15',
  'CTRF':         'CTRF_15',
  'CTRF15':       'CTRF_15',
  'LDS':          'LDS',
  'SWAN':         'SWAN',
  'SRS2_IE_Pais': 'SRS2_IE_Pais',
  'SRS2_IE_Prof': 'SRS2_IE_Prof',
  // ── RAADS-R — v37.0 ──────────────────────────────────────
  'RAADSR':       'RAADSR',
  'raadsr':       'RAADSR',
  'RAADS_R':      'RAADSR',
  'raads_r':      'RAADSR',
  'RAADS-R':      'RAADSR',
  // ── AQ-50 — v38.0 ────────────────────────────────────────
  'AQ50':         'AQ50',
  'aq50':         'AQ50',
  'AQ-50':        'AQ50',
  // ── BAS-3 — v40.0 ────────────────────────────────────────
  'BAS3':         'BAS3',
  'bas3':         'BAS3',
  'BAS-3':        'BAS3',
  'bas_3':        'BAS3',
  'BAS_3':        'BAS3',
  // ── QACSE-R / QACSE-C — Competências Socioemocionais (Coelho & Sousa, 2016/2020) — v51.0 ──
  'QACSE_R':      'QACSE_R',
  'qacse_r':      'QACSE_R',
  'QACSE-R':      'QACSE_R',
  'qacse-r':      'QACSE_R',
  'QACSE_C':      'QACSE_C',
  'qacse_c':      'QACSE_C',
  'QACSE-C':      'QACSE_C',
  'qacse-c':      'QACSE_C',
  // ── PPGR-J — v41.0 ───────────────────────────────────────
  'PPGRJ':        'PPGRJ',
  'ppgrj':        'PPGRJ',
  'PPGR-J':       'PPGRJ',
  'PPGR_J':       'PPGRJ',
  'ppgr-j':       'PPGRJ',
  'ppgr_j':       'PPGRJ',
  // ── CCBQ — v42.0 ─────────────────────────────────────────
  'CCBQ':         'CCBQ',
  'ccbq':         'CCBQ',
  // ── KIDCOPE — v43.0 ──────────────────────────────────────
  'KIDCOPE_CR':         'KIDCOPE_CR',
  'kidcope_cr':         'KIDCOPE_CR',
  'Kidcope_Criancas':   'KIDCOPE_CR',
  'kidcope_criancas':   'KIDCOPE_CR',
  'Kidcope_CR':         'KIDCOPE_CR',
  'KIDCOPE_AD':         'KIDCOPE_AD',
  'kidcope_ad':         'KIDCOPE_AD',
  'Kidcope_Adolescentes':'KIDCOPE_AD',
  'kidcope_adolescentes':'KIDCOPE_AD',
  'Kidcope_AD':         'KIDCOPE_AD',
  // ── ANAMNESE — História Prévia — v44.0 ───────────────────
  'ANAMNESE_HP':  'ANAMNESE_HP',
  'anamnese_hp':  'ANAMNESE_HP',
  'Anamnese_HP':  'ANAMNESE_HP',
  // ── ISC-24 — Inventário de Somatização para Crianças — v45.0 ──
  'ISC24':        'ISC24',
  'isc24':        'ISC24',
  'ISC-24':       'ISC24',
  // ── QEA — Questionário de Esquemas para Adolescentes — v46.0 ──
  'QEA':          'QEA',
  'qea':          'QEA',
  // ── EMP-H&F — Perfeccionismo Multidimensional (Hewitt & Flett, 1991) — v47.0 ──
  'EMP_HF':       'EMP_HF',
  'emp_hf':       'EMP_HF',
  'EMP-HF':       'EMP_HF',
  'EMP-H&F':      'EMP_HF',
  // ── EMP-F — Perfeccionismo Multidimensional (Frost et al., 1990) — v47.0 ──
  'EMP_F':        'EMP_F',
  'emp_f':        'EMP_F',
  'EMP-F':        'EMP_F',
  // ── OCI-CV-R — Inventário Obsessivo-Compulsivo Revisto p/ Crianças (Abramovitch et al., 2022) — v48.0 ──
  'OCI_CV_R':     'OCI_CV_R',
  'oci_cv_r':     'OCI_CV_R',
  'OCI-CV-R':     'OCI_CV_R',
  'ocicvr':       'OCI_CV_R',
  'OCICVR':       'OCI_CV_R',
  // ── OCI-R — Inventário Obsessivo-Compulsivo Revisto (Foa et al., 2002 · versão PT Cardoso, 2015) — v49.0 ──
  'OCI_R':        'OCI_R',
  'oci_r':        'OCI_R',
  'OCI-R':        'OCI_R',
  'ocir':         'OCI_R',
  'OCIR':         'OCI_R',
  // ─────────────────────────────────────────────────────────
  'ABAS3_05':     'ABAS3_05',
  'ABAS3_05P':    'ABAS3_05P',
  'ABAS3_PAIS':   'ABAS3_PAIS',
  'ABAS3_PROF':   'ABAS3_PROF',
  'ABAS3_ADULT':  'ABAS3_ADULT',
  'BRIEF_Professores':            'BRIEF_Professores',
  'BRIEF':                        'BRIEF_Professores',
  'BRIEF_Pais':                   'BRIEF_Pais',
  'BRIEF_PreEscolar_Pais':        'BRIEF_PreEscolar_Pais',
  'BRIEF_PreEscolar_Prof':        'BRIEF_PreEscolar_Professores',
  'BRIEF_PreEscolar_Professores': 'BRIEF_PreEscolar_Professores',
  'brief_pe_pais':                'BRIEF_PreEscolar_Pais',
  'brief_pe_prof':                'BRIEF_PreEscolar_Professores',
  'BRIEF_Autoavaliacao':          'BRIEF_Autoavaliacao',
  'BRIEF_Auto':                   'BRIEF_Autoavaliacao',
  'brief_auto':                   'BRIEF_Autoavaliacao',
  // ── BRIEF-A · versão adulta (v116.0) ──
  'BRIEF_A_AUTO':                 'BRIEF_A_AUTO',
  'BRIEF_A_Autorrelato':          'BRIEF_A_AUTO',
  'brief_a_auto':                 'BRIEF_A_AUTO',
  'BRIEF_A_INF':                  'BRIEF_A_INF',
  'BRIEF_A_Informante':           'BRIEF_A_INF',
  'brief_a_inf':                  'BRIEF_A_INF',
  'SCARED_R_CRIANCA':  'SCARED_R_CRIANCA',
  'SCARED_R_Crianca':  'SCARED_R_CRIANCA',
  'scared_r_crianca':  'SCARED_R_CRIANCA',
  'SCARED_R_PAIS':     'SCARED_R_PAIS',
  'SCARED_R_Pais':     'SCARED_R_PAIS',
  'scared_r_pais':     'SCARED_R_PAIS',
  'SPAS_Pais':         'SPAS_Pais',
  'spas_pais':         'SPAS_Pais',
  'SPAS_Prof':         'SPAS_Prof',
  'spas_prof':         'SPAS_Prof',
  'QEDP':              'QEDP',
  'qedp':              'QEDP',
  'QC':                'QC_Coparentalidade',
  'QC_Coparentalidade':'QC_Coparentalidade',
  'QC_Mae':            'QC_Coparentalidade',
  'QC_Pai':            'QC_Coparentalidade',
  'qc_mae':            'QC_Coparentalidade',
  'qc_pai':            'QC_Coparentalidade',
  'DIVA5':             'DIVA5',
  'DIVA-5':            'DIVA5',
  'diva5':             'DIVA5',
  'ERC_Professores':   'ERC_Professores',
  'ERC_Prof':          'ERC_Professores',
  'erc_prof':          'ERC_Professores',
  'ERC_Pais':          'ERC_Pais',
  'erc_pais':          'ERC_Pais',
  'EAFE':              'EAFE',
  'eafe':              'EAFE',
  'ECE_FEA':           'ECE_FEA',
  'ECE-FEA':           'ECE_FEA',
  'ece_fea':           'ECE_FEA',
  'RCADS_25CG':        'RCADS_25CG',
  'RCADS-25-CG':       'RCADS_25CG',
  'rcads_25cg':        'RCADS_25CG',
  'RCADS_25Y':         'RCADS_25Y',
  'RCADS-25-Y':        'RCADS_25Y',
  'rcads_25y':         'RCADS_25Y',
  'RCADS_47CG':        'RCADS_47CG',
  'RCADS-47-CG':       'RCADS_47CG',
  'rcads_47cg':        'RCADS_47CG',
  'RCADS_47Y':         'RCADS_47Y',
  'RCADS-47-Y':        'RCADS_47Y',
  'rcads_47y':         'RCADS_47Y',
  'EAT26':             'EAT26',
  'EAT-26':            'EAT26',
  'eat26':             'EAT26',
  'CONNERS3P_FULL':    'CONNERS3P_FULL',
  'CONNERS3T_FULL':    'CONNERS3T_FULL',
  'CONNERS3PS':        'CONNERS3PS',
  'CONNERS3TS':        'CONNERS3TS',
  'CONNERS3P':         'CONNERS3P_FULL',
  'CONNERS3T':         'CONNERS3T_FULL',
  'conners3p_full':    'CONNERS3P_FULL',
  'conners3t_full':    'CONNERS3T_FULL',
  'conners3ps':        'CONNERS3PS',
  'conners3ts':        'CONNERS3TS',
  'FAD_GF':            'FAD_GF',
  'FAD-GF':            'FAD_GF',
  'fad_gf':            'FAD_GF',
  'FAD_60':            'FAD_60',
  'FAD-60':            'FAD_60',
  'FAD60':             'FAD_60',
  'fad_60':            'FAD_60',
  'MAP_Parental':      'MAP_Parental',
  'MAP':               'MAP_Parental',
  'map_parental':      'MAP_Parental',
  'MAP_Parental_PI':   'MAP_Parental_PI',
  'MAP_PI':            'MAP_Parental_PI',
  'map_pi':            'MAP_Parental_PI',
  'MAP_Parental_1214': 'MAP_Parental_1214',
  'MAP_1214':          'MAP_Parental_1214',
  'map_1214':          'MAP_Parental_1214',
  'MAP_Parental_1518': 'MAP_Parental_1518',
  'MAP_1518':          'MAP_Parental_1518',
  'map_1518':          'MAP_Parental_1518',
  'Anamnese_Complementar':  'Anamnese_Complementar',
  'anamnese_complementar':  'Anamnese_Complementar',
  'PAIA':  'PAIA',
  'paia':  'PAIA',
  'PAI':   'PAI',
  'pai':   'PAI',
  'MBI_SS':   'MBI_SS',
  'mbi_ss':   'MBI_SS',
  'MBI-SS':   'MBI_SS',
  'mbiss':    'MBI_SS',
  'PS2_Cuidador':  'PS2_Cuidador',
  'ps2pais':       'PS2_Cuidador',
  'PS2_Pais':      'PS2_Cuidador',
  'ps2_cuidador':  'PS2_Cuidador',
  'PS2_Professor': 'PS2_Professor',
  'ps2escola':     'PS2_Professor',
  'PS2_Escola':    'PS2_Professor',
  'ps2_professor': 'PS2_Professor',
  'IPP_R':   'IPP_R',
  'ippr':    'IPP_R',
  'IPP-R':   'IPP_R',
  'IMC_C':   'IMC_C',
  'imc_c':   'IMC_C',
  'IMC-C':   'IMC_C',
  'imcc':    'IMC_C',
  'IVP_Super':  'IVP_Super',
  'ivp_super':  'IVP_Super',
  'IVP-Super':  'IVP_Super',
  'ivpsuper':   'IVP_Super',
  'SDS_Holland':  'SDS_Holland',
  'sds_holland':  'SDS_Holland',
  'SDS-Holland':  'SDS_Holland',
  'sds':          'SDS_Holland',
  'SDS':          'SDS_Holland',
  'JTCI_92':     'JTCI_92',
  'jtci92':      'JTCI_92',
  'JTCI-92':     'JTCI_92',
  'jtci':        'JTCI_92',
  'JTCI':        'JTCI_92',
  'NEOPIR':    'NEOPIR',
  'neopir':    'NEOPIR',
  'NEO_PIR':   'NEOPIR',
  'NEO-PI-R':  'NEOPIR',
  'CSSRS':              'CSSRS',
  'cssrs':              'CSSRS',
  'C-SSRS':             'CSSRS',
  'cssrs_criancas':     'CSSRS',
  'cssrs_adolescentes': 'CSSRS',
  'BSI':    'BSI',
  'bsi':    'BSI',
  'BSI_v1': 'BSI',
  'BESAA':    'BESAA',
  'besaa':    'BESAA',
  'BESAA_v1': 'BESAA',
  'EDEQ':   'EDEQ',
  'edeq':   'EDEQ',
  'EDE-Q':  'EDEQ',
  'ede-q':  'EDEQ',
  'SEQ_C':  'SEQ_C',
  'seqc':   'SEQ_C',
  'SEQ-C':  'SEQ_C',
  'seq_c':  'SEQ_C',
  'Collins_Silhuetas': 'Collins_Silhuetas',
  'collins':           'Collins_Silhuetas',
  'Collins':           'Collins_Silhuetas',
  'COLLINS':           'Collins_Silhuetas',
  'OBS_PHDA_Casa':    'OBS_PHDA_Casa',
  'obs_phda_casa':    'OBS_PHDA_Casa',
  'OBS_PHDA_Escola':  'OBS_PHDA_Escola',
  'obs_phda_escola':  'OBS_PHDA_Escola',
  'ECS':              'ECS',
  'ecs':              'ECS',
  // ── DERS — Dificuldades de Regulação Emocional ─────────────
  'DERS':             'DERS',
  'ders':             'DERS',
  'DERS_v1':          'DERS',
  // ── COMPA — Escala de Avaliação da Comunicação na Parentalidade (Portugal & Alberto, 2014) ──
  'COMPA_P':          'COMPA_P',
  'compap':           'COMPA_P',
  'COMPA-P':          'COMPA_P',
  'compa_p':          'COMPA_P',
  'COMPA_A_Pai':      'COMPA_A_Pai',
  'compa_a_pai':      'COMPA_A_Pai',
  'COMPA-A-Pai':      'COMPA_A_Pai',
  'COMPA_A_Mae':      'COMPA_A_Mae',
  'compa_a_mae':      'COMPA_A_Mae',
  'COMPA-A-Mae':      'COMPA_A_Mae',
  'COMPA_C_Pai':      'COMPA_C_Pai',
  'compa_c_pai':      'COMPA_C_Pai',
  'COMPA-C-Pai':      'COMPA_C_Pai',
  'COMPA_C_Mae':      'COMPA_C_Mae',
  'compa_c_mae':      'COMPA_C_Mae',
  'COMPA-C-Mae':      'COMPA_C_Mae',

  // ── CDI-2:SR — Inventário de Depressão em Crianças (Kovacs & MHS Staff, 2011) ──
  'CDI2_SR':          'CDI2_SR',
  'cdi2sr':           'CDI2_SR',
  'CDI2:SR':          'CDI2_SR',
  'CDI-2:SR':         'CDI2_SR',
  'CDI-2_SR':         'CDI2_SR',

  // ── STAIC C-2 — Inventário de Ansiedade Estado-Traço para Crianças (Spielberger 1973 / D&G 1999) ──
  'STAIC_C2':         'STAIC_C2',
  'staicc2':          'STAIC_C2',
  'staic_c2':         'STAIC_C2',
  'STAIC-C2':         'STAIC_C2',
  'STAIC_C-2':        'STAIC_C2',
  'STAIC C-2':        'STAIC_C2',
  'STAIC':            'STAIC_C2',

  // ── CMAS-R — Questionário de Ansiedade Manifesta (Reynolds & Richmond 1978 / D&G 1999) ──
  'CMAS_R':           'CMAS_R',
  'cmasr':            'CMAS_R',
  'cmas_r':           'CMAS_R',
  'CMAS-R':           'CMAS_R',
  'CMAS':             'CMAS_R',
  'RCMAS':            'CMAS_R',
  'rcmas':            'CMAS_R',

  // ── FSSC-R — Inventário de Medos para Crianças (Ollendick 1978/1983 / D&G 1999) ──
  'FSSC_R':           'FSSC_R',
  'fsscr':            'FSSC_R',
  'fssc_r':           'FSSC_R',
  'FSSC-R':           'FSSC_R',
  'FSSC':             'FSSC_R',
  'FSSCR':            'FSSC_R',

  // ── Sociograma · Mapa Social (Moreno 1934; Coie & Dodge 1988; Bronfenbrenner 1979) — v52.0 ──
  'SOCIOGRAMA':       'SOCIOGRAMA',
  'sociograma':       'SOCIOGRAMA',
  'Sociograma':       'SOCIOGRAMA',
  'SOCIOGRAMA_v1':    'SOCIOGRAMA',
  'sociograma_v1':    'SOCIOGRAMA',

  // ── PALS — Patterns of Adaptive Learning Scales (Midgley et al., 2000) — v53.0 ──
  'PALS_Parent':       'PALS_Parent',
  'pals_parent':       'PALS_Parent',
  'PALS-Parent':       'PALS_Parent',
  'palsparent':        'PALS_Parent',

  'PALS_Teacher':      'PALS_Teacher',
  'pals_teacher':      'PALS_Teacher',
  'PALS-Teacher':      'PALS_Teacher',
  'palsteacher':       'PALS_Teacher',

  'PALS_Student_Sec':       'PALS_Student_Sec',
  'pals_student_sec':       'PALS_Student_Sec',
  'PALS-Student-Sec':       'PALS_Student_Sec',
  'PALS_Student_Secundario': 'PALS_Student_Sec',
  'palsstudentsec':         'PALS_Student_Sec',

  'PALS_Student_23c':       'PALS_Student_23c',
  'pals_student_23c':       'PALS_Student_23c',
  'PALS-Student-23c':       'PALS_Student_23c',
  'PALS_Student_2-3ciclo':  'PALS_Student_23c',
  'palsstudent23c':         'PALS_Student_23c',

  // ── PALS Versões REDUZIDAS — v55.0 ──
  'PALS_Parent_Red':           'PALS_Parent_Red',
  'pals_parent_red':           'PALS_Parent_Red',
  'PALS-Parent-Red':           'PALS_Parent_Red',
  'PALS_Parent_Reduzido':      'PALS_Parent_Red',
  'palsparentred':             'PALS_Parent_Red',

  'PALS_Teacher_Red':          'PALS_Teacher_Red',
  'pals_teacher_red':          'PALS_Teacher_Red',
  'PALS-Teacher-Red':          'PALS_Teacher_Red',
  'PALS_Teacher_Reduzido':     'PALS_Teacher_Red',
  'palsteacherred':            'PALS_Teacher_Red',

  'PALS_Student_Sec_Red':              'PALS_Student_Sec_Red',
  'pals_student_sec_red':              'PALS_Student_Sec_Red',
  'PALS-Student-Sec-Red':              'PALS_Student_Sec_Red',
  'PALS_Student_Secundario_Reduzido':  'PALS_Student_Sec_Red',
  'palsstudentsecred':                 'PALS_Student_Sec_Red',

  'PALS_Student_23c_Red':              'PALS_Student_23c_Red',
  'pals_student_23c_red':              'PALS_Student_23c_Red',
  'PALS-Student-23c-Red':              'PALS_Student_23c_Red',
  'PALS_Student_2-3ciclo_Reduzido':    'PALS_Student_23c_Red',
  'palsstudent23cred':                 'PALS_Student_23c_Red',

  // ── Questionários Ecológicos Revistos — v56.0 ──
  'QEE_Escola':           'QEE_Escola',
  'qee_escola':           'QEE_Escola',
  'QEE-Escola':           'QEE_Escola',
  'QEE':                  'QEE_Escola',
  'qeeescola':            'QEE_Escola',

  'QEP_Pais':             'QEP_Pais',
  'qep_pais':             'QEP_Pais',
  'QEP-Pais':             'QEP_Pais',
  'QEP':                  'QEP_Pais',
  'qeppais':              'QEP_Pais',

  // ── IIM ──────────────────────────────────────────────────────
  'IIM_Hetero':           'IIM_Hetero',
  'iim_hetero':           'IIM_Hetero',
  'IIM-Hetero':           'IIM_Hetero',
  'IIM_Heterorrelato':    'IIM_Hetero',
  'iim_heterorrelato':    'IIM_Hetero',
  'IIM-Heterorrelato':    'IIM_Hetero',
  'iimhetero':            'IIM_Hetero',

  'IIM_Criancas':         'IIM_Criancas',
  'iim_criancas':         'IIM_Criancas',
  'IIM-Criancas':         'IIM_Criancas',
  'IIM_Crianças':         'IIM_Criancas',
  'iimcriancas':          'IIM_Criancas',

  'IIM_AdolAdultos':      'IIM_AdolAdultos',
  'iim_adoladultos':      'IIM_AdolAdultos',
  'IIM-AdolAdultos':      'IIM_AdolAdultos',
  'IIM_Adolescentes_Adultos': 'IIM_AdolAdultos',
  'iim_adolescentes_adultos': 'IIM_AdolAdultos',
  'iimadoladultos':       'IIM_AdolAdultos',

  // ── CERQ ─────────────────────────────────────────────────────
  'CERQ_K':               'CERQ_K',
  'cerq_k':               'CERQ_K',
  'CERQ-K':               'CERQ_K',
  'cerqk':                'CERQ_K',
  'CERQ_18':              'CERQ_18',
  'cerq_18':              'CERQ_18',
  'CERQ-18':              'CERQ_18',
  'cerq18':               'CERQ_18',
  'CERQ_36':              'CERQ_36',
  'cerq_36':              'CERQ_36',
  'CERQ-36':              'CERQ_36',
  'cerq36':               'CERQ_36',

  // ── ERICA ────────────────────────────────────────────────────
  'ERICA':                'ERICA',
  'erica':                'ERICA',

  // ── ERQ-CA ───────────────────────────────────────────────────
  'ERQ_CA':               'ERQ_CA',
  'erq_ca':               'ERQ_CA',
  'ERQ-CA':               'ERQ_CA',
  'erqca':                'ERQ_CA',

  // ── STAXI-NA ─────────────────────────────────────────────────
  'STAXI_NA':             'STAXI_NA',
  'staxi_na':             'STAXI_NA',
  'STAXI-NA':             'STAXI_NA',
  'staxina':              'STAXI_NA',

  // ── MDQ — Mood Disorder Questionnaire (rastreio bipolar) ─────
  'MDQ':                  'MDQ',
  'mdq':                  'MDQ',

  // ── AQ Buss-Perry — Questionário de Agressividade ────────────
  'AQ_BussPerry':         'AQ_BussPerry',
  'aq_bussperry':         'AQ_BussPerry',
  'AQ-BussPerry':         'AQ_BussPerry',
  'AQ':                   'AQ_BussPerry',
  'BussPerry':            'AQ_BussPerry',
  'bussperry':            'AQ_BussPerry',

  // ── ChEAT — Children's Eating Attitude Test ──────────────────
  'ChEAT':                'ChEAT',
  'cheat':                'ChEAT',
  'CHEAT':                'ChEAT',
  'ch_eat':               'ChEAT',

  // ── AQ-Child — Quociente de Espectro do Autismo (Versão Criança) ──
  // Auyeung et al. (2008); tradução portuguesa Coelho (2020)
  'AQ_Child':             'AQ_Child',
  'aq_child':             'AQ_Child',
  'AQ-Child':             'AQ_Child',
  'aqchild':              'AQ_Child',
  'AQChild':              'AQ_Child',

  // ── ISS-I / ESI — Stress Infantil · Lucarelli & Lipp (1998) — v67.0 ──
  'ISS_ESI':   'ISS_ESI',
  'iss_esi':   'ISS_ESI',
  'ISS-I/ESI': 'ISS_ESI',
  'ISS-I':     'ISS_ESI',
  'ISSI':      'ISS_ESI',
  'ESI':       'ISS_ESI',

  // ── C-SSRS-P — Risco Suicidário · Pediátrica · v69.0 ──
  // Ricardina Correia (2026) · 6-11 anos · Auto + Hetero
  'C_SSRS_P':  'C_SSRS_P',
  'c_ssrs_p':  'C_SSRS_P',
  'C-SSRS-P':  'C_SSRS_P',
  'cssrsp':    'C_SSRS_P',
  'CSSRSP':    'C_SSRS_P',

  // ── C-SSRS-A — Risco Suicidário · Adolescente · v69.0 ──
  // Ricardina Correia (2026) · 12-18 anos · Só Auto
  'C_SSRS_A':  'C_SSRS_A',
  'c_ssrs_a':  'C_SSRS_A',
  'C-SSRS-A':  'C_SSRS_A',
  'cssrsa':    'C_SSRS_A',
  'CSSRSA':    'C_SSRS_A',

  // ── C-SSRS-DC — Risco Suicidário · Défice Cognitivo · v69.0 ──
  // Ricardina Correia (2026) · Qualquer idade · Auto + Hetero c/ "Não compreende"
  'C_SSRS_DC': 'C_SSRS_DC',
  'c_ssrs_dc': 'C_SSRS_DC',
  'C-SSRS-DC': 'C_SSRS_DC',
  'cssrsdc':   'C_SSRS_DC',
  'CSSRSDC':   'C_SSRS_DC',

  // ── M-CHAT-R/F — Despiste Precoce de Autismo · v69.0 ──
  // © 2009 Robins, Fein, & Barton · Tradução PT-PT: Carla Cintrão Almeida
  // 16-30 meses · 2 etapas (etapa 2 condicional)
  'M_CHAT_R_F': 'M_CHAT_R_F',
  'm_chat_r_f': 'M_CHAT_R_F',
  'M-CHAT-R-F': 'M_CHAT_R_F',
  'M-CHAT-R/F': 'M_CHAT_R_F',
  'M-CHAT-RF':  'M_CHAT_R_F',
  'MCHAT':      'M_CHAT_R_F',
  'mchat':      'M_CHAT_R_F',
  'MCHATRF':    'M_CHAT_R_F',
  'mchatrf':    'M_CHAT_R_F',

  // ── Família CARS2 (v70.0) ─────────────────────────────────
  // Adaptações inspiradas (Via B) na CARS-2 (Schopler et al., 2010, WPS)
  // CARS2-HP: Funcionamento Elevado · ≥6a, QI≥80, verbal funcional
  'CARS2_HP':  'CARS2_HP',
  'cars2_hp':  'CARS2_HP',
  'CARS2-HP':  'CARS2_HP',
  'cars2-hp':  'CARS2_HP',
  'EARI-AF':   'CARS2_HP',
  'EARI_AF':   'CARS2_HP',
  'eari_af':   'CARS2_HP',
  'eari-af':   'CARS2_HP',
  // CARS2-QPC: Questionário Parental · parent-completed
  'CARS2_QPC': 'CARS2_QPC',
  'cars2_qpc': 'CARS2_QPC',
  'CARS2-QPC': 'CARS2_QPC',
  'cars2-qpc': 'CARS2_QPC',
  'EARI-QP':   'CARS2_QPC',
  'EARI_QP':   'CARS2_QPC',
  'eari_qp':   'CARS2_QPC',
  'eari-qp':   'CARS2_QPC',
  // CARS2-ST: Standard · <6a OU QI≤79 OU verbal limitada/ausente
  'CARS2_ST':  'CARS2_ST',
  'cars2_st':  'CARS2_ST',
  'CARS2-ST':  'CARS2_ST',
  'cars2-st':  'CARS2_ST',
  'EARI-AS':   'CARS2_ST',
  'EARI_AS':   'CARS2_ST',
  'eari_as':   'CARS2_ST',
  'eari-as':   'CARS2_ST',

  // ── MCP · Mapeamento de Configuração Parental (Ricardina Correia, 2026) ───
  // Instrumento clínico ad-hoc · uso orientativo · articulado com entrevista
  // MCP Breve · rastreio rápido da configuração parental e clima educativo
  'MCP_Breve':    'MCP_Breve',
  'mcp_breve':    'MCP_Breve',
  'MCP-Breve':    'MCP_Breve',
  'mcpbreve':     'MCP_Breve',
  // MCP Completo · mapeamento aprofundado (incl. relação afetiva e acomodação dos outros)
  'MCP_Completo': 'MCP_Completo',
  'mcp_completo': 'MCP_Completo',
  'MCP-Completo': 'MCP_Completo',
  'mcpcompleto':  'MCP_Completo',

  // ── UCLA-PTSD Adaptado · Rastreio PSPT Pediátrica (Ricardina Correia, 2026) ───
  // Clinician-rated · 7–11 anos · adaptação inspirada (Via B) do DSM-5-TR
  'UCLA_PTSD_Adaptado': 'UCLA_PTSD_Adaptado',
  'ucla_ptsd_adaptado': 'UCLA_PTSD_Adaptado',
  'ucla_ptsd':          'UCLA_PTSD_Adaptado',
  'ucla':               'UCLA_PTSD_Adaptado',

  // ── ISAS · Inventário de Afirmações sobre Autolesão (Klonsky & Glenn, 2009) ───
  // Auto-resposta · 12–25 anos · 13 funções (6 intra + 7 inter) · Total 0-78
  'ISAS':               'ISAS',
  'isas':               'ISAS',

  // ── FAMÍLIA FASA (Ansiedade · Lebowitz et al.) v71.0 ───
  // FASA Parental — pais/cuidadores · 13 itens
  'FASA_Parental':       'FASA_Parental',
  'fasa_parental':       'FASA_Parental',
  'FASA-Parental':       'FASA_Parental',
  'FASA_PR':             'FASA_Parental',
  'FASA-PT-EU':          'FASA_Parental',
  // FASA CR Infância — autorrelato 7-10 anos · 16 itens (com crenças)
  'FASA_CR_Infancia':    'FASA_CR_Infancia',
  'fasa_cr_infancia':    'FASA_CR_Infancia',
  'FASA-CR-Infancia':    'FASA_CR_Infancia',
  'FASA_CR_I':           'FASA_CR_Infancia',
  'FASA-CR-PT-EU/I':     'FASA_CR_Infancia',
  // FASA CR Adolescência — autorrelato 11-17 anos · 16 itens (com crenças)
  'FASA_CR_Adolescencia':'FASA_CR_Adolescencia',
  'fasa_cr_adolescencia':'FASA_CR_Adolescencia',
  'FASA-CR-Adolescencia':'FASA_CR_Adolescencia',
  'FASA_CR_A':           'FASA_CR_Adolescencia',
  'FASA-CR-PT-EU/A':     'FASA_CR_Adolescencia',

  // ── FAMÍLIA FAS (TOC pediátrico · Calvocoressi/Flessner) v71.0 ───
  // FAS Parental — pais/cuidadores · checklist + 13 itens
  'FAS_Parental':        'FAS_Parental',
  'fas_parental':        'FAS_Parental',
  'FAS-Parental':        'FAS_Parental',
  'FAS_PR':              'FAS_Parental',
  'FAS-PR-PT-EU':        'FAS_Parental',
  // FAS CR Infância — autorrelato 7-10 anos · checklist + 16 itens
  'FAS_CR_Infancia':     'FAS_CR_Infancia',
  'fas_cr_infancia':     'FAS_CR_Infancia',
  'FAS-CR-Infancia':     'FAS_CR_Infancia',
  'FAS_CR_I':            'FAS_CR_Infancia',
  'FAS-CR-PT-EU/I':      'FAS_CR_Infancia',
  // FAS CR Adolescência — autorrelato 11-17 anos · checklist + 16 itens
  'FAS_CR_Adolescencia': 'FAS_CR_Adolescencia',
  'fas_cr_adolescencia': 'FAS_CR_Adolescencia',
  'FAS-CR-Adolescencia': 'FAS_CR_Adolescencia',
  'FAS_CR_A':            'FAS_CR_Adolescencia',
  'FAS-CR-PT-EU/A':      'FAS_CR_Adolescencia',
  // RSES — Escala de Auto-Estima de Rosenberg (autorrelato adolescentes) — v72.0
  'RSES':                'RSES',
  'rses':                'RSES',
  'RSES_PT':             'RSES',
  'Rosenberg':           'RSES',
  // RBS-R — Escala de Comportamentos Repetitivos, Revista — v73.0
  'RBS_R':               'RBS_R',
  'rbs_r':               'RBS_R',
  'RBS-R':               'RBS_R',
  'RBSR':                'RBS_R',
  'rbsr':                'RBS_R',
  'PSI4_adap':           'PSI4_adap',
  'psi4_adap':           'PSI4_adap',
  'PSI4adap':            'PSI4_adap',
  'psi4adap':            'PSI4_adap',
  'PSI-4_adap':          'PSI4_adap',
  'PSI-4 adap':          'PSI4_adap',
  'PSI4':                'PSI4_adap',
  // FACES-IV adap — Coesão e Flexibilidade Familiar — v74.0
  'FACES_IV_adap':       'FACES_IV_adap',
  'faces_iv_adap':       'FACES_IV_adap',
  'FACES-IV_adap':       'FACES_IV_adap',
  'FACES_IV':            'FACES_IV_adap',
  'FACESIV_adap':        'FACES_IV_adap',
  'facesiv_adap':        'FACES_IV_adap',
  'FACES4_adap':         'FACES_IV_adap',

  // CABS — Escala de Comportamento Assertivo para Crianças — v75.0
  'CABS_Auto':           'CABS_Auto',
  'cabs_auto':           'CABS_Auto',
  'CABS_Autorrelato':    'CABS_Auto',
  'CABS_AUTO':           'CABS_Auto',
  'CABS_Hetero':         'CABS_Hetero',
  'cabs_hetero':         'CABS_Hetero',
  'CABS_Heterorrelato':  'CABS_Hetero',
  'CABS_HETERO':         'CABS_Hetero',

  // SPPA — «Como é que eu sou?» + Importância (Harter, bateria única) — v76.0
  'SPPA':                'SPPA',
  'sppa':                'SPPA',
  'SPPA_Bateria':        'SPPA',
  'Harter_SPPA':         'SPPA',

  // SPPC — «Como é que eu sou» + Importância (Harter, bateria única crianças) — v77.0
  'SPPC':                'SPPC',
  'sppc':                'SPPC',
  'SPPC_Bateria':        'SPPC',
  'Harter_SPPC':         'SPPC',

  // SPPC_Professor — Escala de Avaliação do Professor — v77.0
  'SPPC_Professor':      'SPPC_Professor',
  'sppc_professor':      'SPPC_Professor',
  'SPPC_PROFESSOR':      'SPPC_Professor',

  // SPPLD — «Como Eu Sou» + Importância (Renick & Harter, bateria única DAE) — v78.0
  'SPPLD':               'SPPLD',
  'sppld':               'SPPLD',
  'SPPLD_Bateria':       'SPPLD',
  'Harter_SPPLD':        'SPPLD',
  'SPP-LD':              'SPPLD',
  'SPPCS':               'SPPCS',
  'sppcs':               'SPPCS',
  'SPPCS_Bateria':       'SPPCS',
  'Harter_SPPCS':        'SPPCS',
  'SPP-CS':              'SPPCS',

  // EPCAS-PE — Escala Pictórica de Competência Percebida e Aceitação Social (Harter & Pike) — v80.0
  'EPCAS_PE':            'EPCAS_PE',
  'epcas_pe':            'EPCAS_PE',
  'EPCAS-PE':            'EPCAS_PE',
  'EPCASPE':             'EPCAS_PE',
  'epcaspe':             'EPCAS_PE',

  // ── Diário de Episódios · Monitorização inter-sessões (Ricardina Correia) — v81.0 ──
  'DIARIO_EPISODIOS':    'DIARIO_EPISODIOS',
  'diario_episodios':    'DIARIO_EPISODIOS',
  'DIARIO-EPISODIOS':    'DIARIO_EPISODIOS',
  'Diario_Episodios':    'DIARIO_EPISODIOS',
  'DiarioEpisodios':     'DIARIO_EPISODIOS',
  // ── Anamnese Parental Complementar (Ricardina Correia, 2026) ──
  'ANAMNESE_PARENTAL_COMPLEMENTAR':  'ANAMNESE_PARENTAL_COMPLEMENTAR',
  'anamnese_parental_complementar':  'ANAMNESE_PARENTAL_COMPLEMENTAR',
  'ANAMNESE-PARENTAL-COMPLEMENTAR':  'ANAMNESE_PARENTAL_COMPLEMENTAR',
  'AnamneseParentalComplementar':    'ANAMNESE_PARENTAL_COMPLEMENTAR',
  // ── Entrevista adaptada CAARMS (Ricardina Correia, 2026) ──
  'CAARMS_ADAP':   'CAARMS_ADAP',
  'caarms_adap':   'CAARMS_ADAP',
  'CAARMS-ADAP':   'CAARMS_ADAP',
  'CAARMS_adap':   'CAARMS_ADAP',
  'CaarmsAdap':    'CAARMS_ADAP',
  'CAARMS':        'CAARMS_ADAP',
  'caarms':        'CAARMS_ADAP',
  // ── Prova «O Cuidar e a Integridade do Corpo» (Ricardina Correia, 2026) ──
  'CUIDAR_CORPO':          'CUIDAR_CORPO',
  'cuidar_corpo':          'CUIDAR_CORPO',
  'CUIDAR-CORPO':          'CUIDAR_CORPO',
  'CuidarCorpo':           'CUIDAR_CORPO',
  'Cuidar_Corpo':          'CUIDAR_CORPO',
  'PROVA_CUIDAR_CORPO':    'CUIDAR_CORPO',
  'cuidar_integridade_corpo': 'CUIDAR_CORPO',
  // ── CSAS · Ansiedade de Separação (autorrelato criança, Méndez et al., 2014) ──
  'CSAS':   'CSAS',
  'csas':   'CSAS',
  'CSAS_Crianca':  'CSAS',
  'CSAS_CRIANCA':  'CSAS',
  // ── CSAS-P · Ansiedade de Separação (versão pais, Méndez et al., 2022) ──
  'CSAS_P': 'CSAS_P',
  'csas_p': 'CSAS_P',
  'CSAS-P': 'CSAS_P',
  'csas-p': 'CSAS_P',
  'CSASP':  'CSAS_P',
  'CSAS_Pais': 'CSAS_P',
};


// ── UTILITÁRIOS ──────────────────────────────────────────────

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0 && HEADERS[name]) {
    sh.appendRow(HEADERS[name]);
    sh.getRange(1, 1, 1, HEADERS[name].length)
      .setBackground('#3B5A7A')
      .setFontColor('white')
      .setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseData(raw) {
  if (!raw) return new Date().toLocaleDateString('pt-PT');
  var s = raw.toString().trim();
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(s)) return s.replace(/-/g, '/');
  var d = new Date(raw);
  return isNaN(d.getTime())
    ? new Date().toLocaleDateString('pt-PT')
    : d.toLocaleDateString('pt-PT');
}


// ── Deduplicação na escrita (upsert) ─────────────────────────
// Instrumentos aqui listados fazem UPSERT em vez de APPEND: se já existir uma
// linha com a mesma chave (colunas identificadas por NOME no cabeçalho real da
// folha), essa linha é SUBSTITUÍDA; caso contrário, a linha é acrescentada.
// Só afeta os instrumentos listados — todos os restantes continuam a fazer
// appendRow exatamente como antes (diff estritamente aditivo).
var DEDUPE_KEYS = {
  // Família EIF (v121.0) — chave de SEIS elementos: os quatro da Secção 33
  // (Código + Data + tipo de respondente + nome) MAIS Forma e Momento.
  // Sem 'Momento', um M2 submetido no mesmo dia do M1 pelo mesmo respondente
  // seria descartado em silêncio; sem 'Forma', o mesmo sucederia a um
  // autorrelato e a um heterorrelato preenchidos pela mesma pessoa — situação
  // corrente quando o cuidador preenche a forma P e o jovem a forma C na mesma
  // consulta. A extensão é aditiva (mais discriminante, nunca menos) e mantém a
  // idempotência: a mesma submissão dá sempre a mesma chave.
  'EIFP':              ['Código', 'Data', 'PreenchidoPor', 'NomePreenche', 'Forma', 'Momento'],
  'EIFA':              ['Código', 'Data', 'PreenchidoPor', 'NomePreenche', 'Forma', 'Momento'],
  'EIFJ':              ['Código', 'Data', 'PreenchidoPor', 'NomePreenche', 'Forma', 'Momento'],
  // CAARS (v120.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. As colunas chamam-se 'Informante' e 'NomeInformante' e
  // resolvem pelos DEDUPE_ALIASES já existentes ('PreenchidoPor' → 'Informante' ·
  // 'NomePreenche' → 'NomeInformante'). Nenhum alias foi criado ou alterado.
  // A chave é indispensável na forma O:L: dois observadores distintos da mesma pessoa
  // (por exemplo cônjuge e progenitor) podem submeter no mesmo dia sob o MESMO código
  // de processo, e o valor clínico do CAARS está precisamente no contraste entre
  // fontes — uma chave mais restritiva descartaria uma das submissões em silêncio.
  // Na forma S:L o 'Informante' é sempre 'Auto-relato' e é o nome que desempata
  // reaplicações; a chave mantém-se idempotente em re-submissões.
  'CAARS_SL':          ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  'CAARS_OL':          ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // EII-PT (v119.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. As colunas chamam-se 'Informante' e 'NomeInformante' e
  // resolvem pelos DEDUPE_ALIASES já existentes ('PreenchidoPor' → 'Informante' ·
  // 'NomePreenche' → 'NomeInformante'). Nenhum alias foi criado ou alterado.
  // A chave é indispensável porque as Formas A e J partilham a mesma aba: um
  // progenitor (Forma A) e o filho adolescente (Forma J) podem submeter no mesmo dia
  // sob o MESMO código de processo, e uma chave mais restritiva descartaria uma das
  // submissões em silêncio. O nome desempata ainda reaplicações do mesmo respondente
  // em datas distintas e mantém a chave idempotente em re-submissões.
  'EII27':             ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  'EII12':             ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // BRIEF-A (v116.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. A coluna de tipo chama-se 'Relação' em ambas as abas, pelo que
  // se usa a chave 'Relacao' (já existente nos DEDUPE_ALIASES desde v91.0);
  // 'NomePreenche' resolve para 'NomeInformante' pelos aliases já existentes.
  // Nenhum alias foi criado ou alterado.
  // A chave é indispensável na versão de informante: dois informantes distintos da
  // mesma pessoa (por exemplo cônjuge e irmão) podem submeter no mesmo dia sob o MESMO
  // código, e o valor clínico do instrumento está precisamente no contraste entre a
  // descrição do próprio e a de cada informante. Uma chave mais restritiva descartaria
  // silenciosamente uma das submissões e anularia a triangulação.
  // Na versão de autorrelato a 'Relação' é sempre 'Autorrelato' e o nome desempata
  // reaplicações; a chave mantém-se idempotente em re-submissões.
  'BRIEF_A_AUTO':      ['Código', 'Data', 'Relacao', 'NomePreenche'],
  'BRIEF_A_INF':       ['Código', 'Data', 'Relacao', 'NomePreenche'],
  // PSWQ (v115.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. As colunas chamam-se 'Informante' e 'NomeInformante' e
  // resolvem pelos DEDUPE_ALIASES já existentes ('PreenchidoPor' → 'Informante' ·
  // 'NomePreenche' → 'NomeInformante'). Nenhum alias foi criado ou alterado.
  // A chave é indispensável: o PSWQ é de autorrelato e mede a preocupação de QUEM
  // PREENCHE. O jovem e cada progenitor podem submeter no mesmo dia sob o MESMO
  // código de paciente, e por vezes com o mesmo rótulo de tipo — o nome desempata.
  // Descartar qualquer uma das linhas apagaria o resultado de um respondente distinto.
  'PSWQ':              ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // BAI e BDI-II (v114.0) — dedupe de 4 elementos (Secção 33): código + data + tipo
  // de respondente + nome. As colunas chamam-se 'Informante' e 'NomeInformante' e
  // resolvem pelos DEDUPE_ALIASES já existentes ('PreenchidoPor' → 'Informante' ·
  // 'NomePreenche' → 'NomeInformante'). Nenhum alias foi criado ou alterado.
  // A chave é indispensável: ambas as escalas são de autorrelato e podem ser
  // aplicadas ao jovem e a cada progenitor no mesmo dia, sob o MESMO código de
  // paciente. Cada linha descreve uma pessoa diferente — descartar qualquer uma
  // apagaria o resultado clínico de um respondente distinto.
  'BAI':               ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  'BDI2':              ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // GCSA e GCSA_Diario (v111.0) — dedupe de 4 elementos (Secção 33): código + data +
  // tipo de respondente + nome. A coluna de tipo chama-se 'Informante' e a de nome
  // 'NomeInformante'; ambas resolvem pelos DEDUPE_ALIASES já existentes
  // ('PreenchidoPor' → 'Informante' · 'NomePreenche' → 'NomeInformante').
  // Nenhum alias foi criado ou alterado.
  // Aqui a chave é indispensável e não meramente defensiva: a grelha convida
  // explicitamente ao registo de leituras divergentes entre progenitores em vez do
  // consenso prévio (D-07), e o painel calcula o índice de divergência por
  // subdimensão a partir das duas linhas. Uma chave mais restritiva descartaria
  // silenciosamente uma das submissões e anularia a comparação entre informantes,
  // que é uma das saídas interpretativas do instrumento.
  'GCSA':              ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  'GCSA_Diario':       ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // CAPS-22 e CAPS-PR (v109.0) — dedupe de 4 elementos (Secção 33): código + data +
  // tipo de respondente + nome. A coluna de tipo chama-se 'Informante' e a de nome
  // 'NomeInformante'; ambas resolvem pelos DEDUPE_ALIASES já existentes
  // ('PreenchidoPor' → 'Informante' · 'NomePreenche' → 'NomeInformante').
  // Nenhum alias foi criado ou alterado.
  // No CAPS-22 o 'Informante' é sempre 'Criança' (autorrelato), pelo que o
  // discriminante efectivo é o nome — suficiente, porque uma criança não preenche
  // dois protocolos distintos do mesmo instrumento no mesmo dia.
  // No CAPS-PR a chave é indispensável: mãe e pai descrevem a MESMA criança no mesmo
  // dia e têm de gerar 2 linhas distintas — é essa a comparação entre informantes
  // que o instrumento prevê, e que respostas combinadas anulariam.
  // PDRA-9 (v110.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome, que resolvem para 'Informante' e 'NomeInformante' pelos
  // DEDUPE_ALIASES já existentes. Nenhum alias criado ou alterado. As duas formas
  // ocupam abas distintas, pelo que criança e progenitor nunca colidem entre si; a
  // chave garante que mãe e pai, no mesmo dia e para a mesma criança, geram 2 linhas
  // distintas no PDRA9_P — que é a comparação entre informantes prevista.
  'PDRA9_C':           ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  'PDRA9_P':           ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  'CAPS22':            ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  'CAPS_PR':           ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // QCF-P (v108.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. A coluna de tipo chama-se 'Informante' e a de nome
  // 'NomeInformante'; ambas resolvem pelos DEDUPE_ALIASES já existentes
  // ('PreenchidoPor' → 'Informante' · 'NomePreenche' → 'NomeInformante').
  // Nenhum alias foi alterado. Aqui a chave padrão é a correcta: mãe e pai
  // descrevem a MESMA fratria no mesmo dia e têm de gerar 2 linhas distintas —
  // é essa a leitura de discrepância entre informadores prevista pelo instrumento.
  'QCFP':              ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // QRF-C (v107.0) — dedupe de 4 elementos (Secção 33) com discriminante próprio:
  // código + data + IRMÃO-ALVO + nome do respondente. Neste instrumento o
  // respondente é sempre o próprio (autorrelato), pelo que não distingue nada;
  // o que distingue duas submissões legítimas no mesmo dia é a díade avaliada.
  // Uma criança com dois irmãos preenche dois protocolos no mesmo dia: sem
  // 'NomeIrmao' na chave, o segundo sobrescreveria o primeiro.
  // 'NomeIrmao' é uma chave NOVA dos DEDUPE_ALIASES (v107.0); 'NomePreenche'
  // resolve para a coluna 'NomeInformante' pelos aliases já existentes.
  'QRFC':              ['Código', 'Data', 'NomeIrmao', 'NomePreenche'],
  // CBQ-SF (v106.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. A coluna de tipo chama-se 'Informante' e a de nome
  // 'NomeInformante'; ambas resolvem pelos DEDUPE_ALIASES já existentes
  // ('PreenchidoPor' → 'Informante' · 'NomePreenche' → 'NomeInformante').
  // Nenhum alias foi alterado. Garante que mãe e pai da mesma criança, no mesmo
  // dia, geram 2 linhas distintas em vez de uma sobrescrever a outra.
  'CBQ_SF':            ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // QCVE-P (v105.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. A coluna de tipo chama-se 'Informante' e a de nome
  // 'NomeInformante'; ambas já resolvem através dos DEDUPE_ALIASES existentes
  // ('PreenchidoPor' → 'Informante' · 'NomePreenche' → 'NomeInformante').
  // Nenhum alias foi alterado. Garante que dois docentes da mesma criança, no
  // mesmo dia, geram 2 linhas distintas em vez de uma sobrescrever a outra.
  'QCVEP_PROF':        ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // SMQ (v104.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. A coluna de tipo chama-se 'Relação' em ambas as versões,
  // pelo que se usa a chave 'Relacao' (já existente nos DEDUPE_ALIASES desde v91.0);
  // 'NomePreenche' resolve para 'NomeInformante'. Nenhum alias foi alterado.
  // Garante que mãe e pai, ou dois professores, no mesmo dia geram 2 linhas.
  'SMQ_Pais':          ['Código', 'Data', 'Relacao', 'NomePreenche'],
  'SMQ_Prof':          ['Código', 'Data', 'Relacao', 'NomePreenche'],
  'CBCL_618': ['Código', 'Data', 'PreenchidoPor'],
  // GAD-7 (v93.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de respondente + nome.
  // 'PreenchidoPor' resolve para a coluna 'Informante' e 'NomePreenche' para 'NomeInformante'
  // através dos DEDUPE_ALIASES já existentes — nenhum alias foi alterado.
  'GAD7':              ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // AIS-8 (v92.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de respondente + nome.
  // 'PreenchidoPor' resolve para a coluna 'Informante' e 'NomePreenche' para 'NomeInformante'
  // através dos DEDUPE_ALIASES já existentes — nenhum alias foi alterado.
  'AIS_8':             ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // ESS (v117.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de respondente + nome.
  // 'PreenchidoPor' resolve para a coluna 'Informante' e 'NomePreenche' para 'NomeInformante'
  // através dos DEDUPE_ALIASES já existentes — nenhum alias foi criado ou alterado.
  'ESS_Epworth':       ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // STOP-BANG (v118.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. As colunas chamam-se 'Informante' e 'NomeInformante' e
  // resolvem pelos DEDUPE_ALIASES já existentes ('PreenchidoPor' → 'Informante' ·
  // 'NomePreenche' → 'NomeInformante'). Nenhum alias criado ou alterado.
  // A chave é necessária: o mesmo utente pode ser reavaliado no mesmo dia por
  // profissionais diferentes, e o protocolo pode ser repetido no próprio dia após
  // correção de uma medição antropométrica. Uma chave de 2 ou 3 elementos descartaria
  // silenciosamente a segunda submissão.
  'STOPBANG':          ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // ACE-Q — dedupe robusta de 4 elementos (Secção 33): código + data + tipo + nome do respondente
  'ACE_Q_ADOLESCENTE': ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  'ACE_Q_CUIDADOR':    ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // Entrevista adaptada CAARMS — dedupe de 4 elementos (código + data + informante + nome do informante)
  'CAARMS_ADAP':       ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // Prova «O Cuidar e a Integridade do Corpo» — dedupe de 4 elementos (aplicada pela psicóloga)
  'CUIDAR_CORPO':      ['Código', 'Data', 'PreenchidoPor', 'NomePreenche'],
  // Diário de Episódios — MODELO POR EPISÓDIO (v90.0): dedupe por Código + EpisodioID.
  // Cada episódio é único; reenvios do MESMO episódio (edição) atualizam a linha, não duplicam.
  'DIARIO_EPISODIOS':  ['Código', 'EpisodioID'],
  // SGRS (v91.0) — dedupe de 4 elementos: código + data + tipo de respondente (Relação) + nome do respondente.
  // O instrumento admite pais, professor e clínico em paralelo para a mesma criança e na mesma data.
  'SGRS':              ['Código', 'Data', 'Relacao', 'NomePreenche'],
  // SIAS · SPS (v113.0) — dedupe de 4 elementos (Secção 33): código + data + tipo de
  // respondente + nome. As colunas chamam-se 'Informante' e 'NomeInformante' e
  // resolvem pelos DEDUPE_ALIASES já existentes ('PreenchidoPor' → 'Informante' ·
  // 'NomePreenche' → 'NomeInformante'). Nenhum alias criado ou alterado.
  // Aqui a chave é sobretudo defensiva: o instrumento é de autorrelato e o tipo de
  // respondente é sempre o próprio (com ou sem apoio de um adulto), pelo que o
  // discriminante efectivo é o nome. Mantém-se a chave de 4 elementos para que uma
  // reaplicação noutra data gere sempre linha nova e um reenvio da mesma submissão
  // continue a ser idempotente.
  'SIAS_SPS':          ['Código', 'Data', 'PreenchidoPor', 'NomePreenche']
};

// Aliases de nome de coluna para localizar as chaves em cabeçalhos com variações
var DEDUPE_ALIASES = {
  // ── v121.0 · duas chaves NOVAS (não alteram nenhum alias existente) ──
  // Usadas apenas pela família EIF, cujo discriminante de dedupe não é só o
  // respondente: o mesmo respondente pode submeter legitimamente a Forma de
  // autorrelato e a de heterorrelato, e a avaliação de base (M1) e a reavaliação
  // (M2), sob o mesmo código. Deliberadamente separadas das restantes chaves
  // para que nenhum instrumento já integrado altere o seu comportamento.
  'Forma':         ['Forma', 'forma'],
  'Momento':       ['Momento', 'momento'],
  'Código':        ['Código', 'Codigo', 'codigo', 'Código Paciente', 'CodigoPaciente', 'patientCode'],
  'Data':          ['Data', 'data', 'date'],
  'PreenchidoPor': ['PreenchidoPor', 'preenchidoPor', 'Preenchido Por', 'Informante', 'informante'],
  'NomePreenche':  ['NomePreenche', 'nome_preenche', 'nomePreenche', 'NomeInformante', 'nomeInformante'],
  'EpisodioID':    ['EpisodioID', 'episodioId', 'episodio_id', 'EpisodeID', 'id'],
  // ── v91.0 · chave NOVA (não altera nenhum alias existente) ──
  // Usada apenas pelos instrumentos cuja coluna de tipo de respondente se chama 'Relação'
  // (actualmente só a SGRS). Deliberadamente separada de 'PreenchidoPor' para que
  // nenhum instrumento já existente mude de comportamento de dedupe.
  'Relacao':       ['Relação', 'Relacao', 'relacao', 'relação', 'Relação com a criança'],
  // ── v107.0 · chave NOVA (não altera nenhum alias existente) ──
  // Usada apenas pelo QRF-C, cujo discriminante de dedupe não é o respondente
  // (é sempre o próprio, em autorrelato) mas o IRMÃO-ALVO da díade avaliada.
  // Deliberadamente separada das restantes chaves para que nenhum instrumento
  // já existente altere o seu comportamento de dedupe.
  'NomeIrmao':     ['NomeIrmão', 'NomeIrmao', 'nomeIrmao', 'nome_irmao', 'Irmão-alvo']
};

function _normKey(v) {
  return (v === undefined || v === null) ? '' : v.toString().trim();
}

// Índice (0-based) da 1.ª coluna cujo cabeçalho case com qualquer alias; -1 se ausente
function _colIndexByNames(headerRow, names) {
  for (var n = 0; n < names.length; n++) {
    var target = names[n].toString().trim().toLowerCase();
    for (var c = 0; c < headerRow.length; c++) {
      if (headerRow[c].toString().trim().toLowerCase() === target) return c;
    }
  }
  return -1;
}

// Faz upsert de `row` na folha `sh`, usando as colunas-chave `keyNames`.
// A comparação lê as colunas-chave POR NOME no cabeçalho real da folha.
// Devolve { updated: true, rowNum } se substituiu, senão { updated: false }.
function upsertRow(sh, row, keyNames) {
  var lastRow = sh.getLastRow();
  if (lastRow >= 2) {
    var nCols   = Math.max(sh.getLastColumn(), row.length);
    var headers = sh.getRange(1, 1, 1, nCols).getValues()[0];

    // índice de cada coluna-chave no cabeçalho da folha
    var keyIdx = keyNames.map(function(kn) {
      return _colIndexByNames(headers, DEDUPE_ALIASES[kn] || [kn]);
    });
    // valor-chave da nova linha (a linha vem alinhada ao cabeçalho da folha)
    var keyVal = keyIdx.map(function(ix) { return ix >= 0 ? _normKey(row[ix]) : null; });

    // só deduplica se pelo menos uma coluna-chave existir e tiver valor
    var hasUsableKey = keyVal.some(function(v) { return v !== null && v !== ''; });
    if (hasUsableKey) {
      var data = sh.getRange(2, 1, lastRow - 1, nCols).getValues();
      for (var r = 0; r < data.length; r++) {
        var match = true;
        for (var k = 0; k < keyIdx.length; k++) {
          if (keyIdx[k] < 0 || keyVal[k] === null) continue; // coluna ausente → ignora
          if (_normKey(data[r][keyIdx[k]]) !== keyVal[k]) { match = false; break; }
        }
        if (match) {
          sh.getRange(r + 2, 1, 1, row.length).setValues([row]);
          return { updated: true, rowNum: r + 2 };
        }
      }
    }
  }
  sh.appendRow(row);
  return { updated: false };
}


// ── doPost ───────────────────────────────────────────────────

// ── v112.0 · helpers do DIVA-5 ───────────────────────────────────────────

// Pré-formata uma coluna inteira como texto ('@'), pelo nome do cabeçalho real
// da folha. Idempotente e barato. Chamado antes do append para que o valor
// entre já como texto — formatar DEPOIS não desfaz uma coerção.
function garantirColunaTexto_(sh, nomeColuna) {
  if (!sh) return;
  var ultimaCol = sh.getLastColumn();
  if (ultimaCol < 1) return;
  var cabecalhos = sh.getRange(1, 1, 1, ultimaCol).getValues()[0];
  var idx = -1;
  for (var c = 0; c < cabecalhos.length; c++) {
    if (String(cabecalhos[c]).trim() === nomeColuna) { idx = c; break; }
  }
  if (idx === -1) return;
  sh.getRange(1, idx + 1, sh.getMaxRows(), 1).setNumberFormat('@');
}

// Confirmação de entrega para o respondente (contorna o silêncio do no-cors).
// Devolve APENAS booleanos — nunca dados clínicos. Um GET normal devolveria ao
// browser do respondente as submissões dos outros informadores do mesmo caso.
function verificarEntrega_(e) {
  var out = { ok: false, respostasOk: false };
  try {
    var p  = e.parameter || {};
    var sh = SpreadsheetApp.getActiveSpreadsheet()
               .getSheetByName(ABA[p.instrumento] || p.instrumento || 'DIVA5');
    if (sh && sh.getLastRow() > 1) {
      var nCols = sh.getLastColumn();
      var cab   = sh.getRange(1, 1, 1, nCols).getValues()[0];
      var iCod  = cab.indexOf('Código');
      var iRes  = cab.indexOf('Respondente');
      var iRel  = cab.indexOf('Relação');
      var iRsp  = cab.indexOf('Respostas');
      var ini   = Math.max(2, sh.getLastRow() - 59);   // só as últimas 60 linhas
      var vals  = sh.getRange(ini, 1, sh.getLastRow() - ini + 1, nCols).getValues();
      var aC = String(p.codigo      || '').trim().toUpperCase();
      var aN = String(p.respondente || '').trim().toLowerCase();
      var aR = String(p.relacao     || '').trim().toLowerCase();
      for (var i = vals.length - 1; i >= 0; i--) {
        var r = vals[i];
        if (iCod < 0 || String(r[iCod] || '').trim().toUpperCase() !== aC) continue;
        if (aN && iRes >= 0 && String(r[iRes] || '').trim().toLowerCase() !== aN) continue;
        if (aR && iRel >= 0 && String(r[iRel] || '').trim().toLowerCase() !== aR) continue;
        out.ok = true;
        out.respostasOk = (iRsp >= 0) &&
                          (String(r[iRsp] || '').split(';').length === 18);
        break;
      }
    }
  } catch (err) { out.erro = String(err); }
  return jsonResponse(out);
}


function doPost(e) {
  try {
    var raw = (e.postData && e.postData.contents) ? e.postData.contents : '';
    var payload = JSON.parse(raw);

    var tipo, d;
    if (payload.sheet && payload.data) {
      tipo = payload.sheet;
      d    = payload.data;
    } else {
      tipo = payload.instrumento || payload.tipo || payload.sheet || payload.tab || '';
      d    = payload;
    }

    var abaNome = ABA[tipo];
    if (!abaNome) return jsonResponse({ status: 'error', message: 'Tipo desconhecido: ' + tipo });
    var sh  = getOrCreateSheet(abaNome);
    var row = buildRow(abaNome, d);

    // ── v112.0 · DIVA-5: forçar a coluna 'Respostas' a texto literal ───────
    // Âmbito deliberadamente limitado ao DIVA5 — nenhum outro instrumento
    // muda de comportamento. Sem isto, o locale pt-PT pode coagir a string
    // "Sim|Não;Sim|Não;..." e a grelha de convergência recebe lixo.
    if (abaNome === 'DIVA5') garantirColunaTexto_(sh, 'Respostas');

    var updated = false;
    if (DEDUPE_KEYS[abaNome]) {
      updated = upsertRow(sh, row, DEDUPE_KEYS[abaNome]).updated;
    } else {
      sh.appendRow(row);
    }
    return jsonResponse({ status: 'ok', aba: abaNome, updated: updated });
  } catch(err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}


// ── buildRow ─────────────────────────────────────────────────

function buildRow(abaNome, d) {
  var hoje = parseData(d.data || d.date || d.Data);
  var cod  = d.patientCode || d.CodigoPaciente || d.codigo || d.Código || '';
  var nome = d.nomeCrianca || d.NomeCrianca || d.childName || d.nome || '';

  // ── Família EIF · EIFP, EIFA e EIFJ (v121.0) ────────────────────────────
  // Ordem das colunas idêntica à de HEADERS['EIFP'] (23), ['EIFA'] (24) e
  // ['EIFJ'] (25) — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA: nesta família o ZERO é resultado legítimo e
  //   clinicamente informativo —
  //     C_TOTAL / A_TOTAL / P_TOTAL / S_TOTAL = 0 → ausência declarada de
  //       interferência funcional, que é um resultado, não um dado em falta;
  //     N_ASSIN_* = 0 → nenhum domínio atinge o limiar (>5), resultado esperado
  //       num caso sem compromisso;
  //     Dias_* = 0 → nenhum dia de ausência, distinto de «não respondeu».
  //   (x||'') converteria todos estes casos em célula vazia, isto é, faria um
  //   protocolo perfeitamente válido parecer um protocolo sem dados.
  if (abaNome === 'EIFP') {
    return [
      hoje, cod,
      nome || d.nomeUtente || '',
      d.nome_informante != null ? d.nome_informante : (d.nomeInformante || ''),
      d.informante != null ? d.informante : '',
      d.relacao    != null ? d.relacao    : '',
      d.idade      != null ? d.idade      : '',
      d.forma      != null ? d.forma      : '',
      d.momento    != null ? d.momento    : '',
      d.problema   != null ? d.problema   : '',
      d.C_TOTAL    != null ? d.C_TOTAL    : '',
      d.C_MEDIA    != null ? d.C_MEDIA    : '',
      d.C_BANDA    != null ? d.C_BANDA    : '',
      d.S_SUB_I    != null ? d.S_SUB_I    : (d.P_SUB_I  != null ? d.P_SUB_I  : ''),
      d.P_SUB_II   != null ? d.P_SUB_II   : '',
      d.P_TOTAL    != null ? d.P_TOTAL    : '',
      d.P_MEDIA    != null ? d.P_MEDIA    : '',
      d.P_BANDA    != null ? d.P_BANDA    : '',
      d.N_ASSIN_C  != null ? d.N_ASSIN_C  : '',
      d.N_ASSIN_P  != null ? d.N_ASSIN_P  : '',
      d.Dias_Ausencia   != null ? d.Dias_Ausencia   : '',
      d.Dias_Rendimento != null ? d.Dias_Rendimento : '',
      d.Respostas  != null ? d.Respostas  : ''
    ];
  }

  if (abaNome === 'EIFA') {
    return [
      hoje, cod,
      nome || d.nomeUtente || '',
      d.nome_informante != null ? d.nome_informante : (d.nomeInformante || ''),
      d.informante != null ? d.informante : '',
      d.relacao    != null ? d.relacao    : '',
      d.idade      != null ? d.idade      : '',
      d.sexo       != null ? d.sexo       : '',
      d.forma      != null ? d.forma      : '',
      d.momento    != null ? d.momento    : '',
      d.problema   != null ? d.problema   : '',
      d.A_TOTAL    != null ? d.A_TOTAL    : '',
      d.A_MEDIA    != null ? d.A_MEDIA    : '',
      d.A_BANDA    != null ? d.A_BANDA    : '',
      d.S_SUB_I    != null ? d.S_SUB_I    : '',
      d.S_SUB_II   != null ? d.S_SUB_II   : '',
      d.S_TOTAL    != null ? d.S_TOTAL    : '',
      d.S_MEDIA    != null ? d.S_MEDIA    : '',
      d.S_BANDA    != null ? d.S_BANDA    : '',
      d.N_ASSIN_A  != null ? d.N_ASSIN_A  : '',
      d.N_ASSIN_S  != null ? d.N_ASSIN_S  : '',
      d.Dias_Ausencia   != null ? d.Dias_Ausencia   : '',
      d.Dias_Rendimento != null ? d.Dias_Rendimento : '',
      d.Respostas  != null ? d.Respostas  : ''
    ];
  }

  if (abaNome === 'EIFJ') {
    return [
      hoje, cod,
      nome || d.nomeUtente || '',
      d.nome_informante != null ? d.nome_informante : (d.nomeInformante || ''),
      d.informante != null ? d.informante : '',
      d.relacao    != null ? d.relacao    : '',
      d.idade      != null ? d.idade      : '',
      d.sexo       != null ? d.sexo       : '',
      d.referente  != null ? d.referente  : '',
      d.forma      != null ? d.forma      : '',
      d.momento    != null ? d.momento    : '',
      d.problema   != null ? d.problema   : '',
      d.A_TOTAL    != null ? d.A_TOTAL    : '',
      d.A_MEDIA    != null ? d.A_MEDIA    : '',
      d.A_BANDA    != null ? d.A_BANDA    : '',
      d.S_SUB_I    != null ? d.S_SUB_I    : '',
      d.S_SUB_II   != null ? d.S_SUB_II   : '',
      d.S_TOTAL    != null ? d.S_TOTAL    : '',
      d.S_MEDIA    != null ? d.S_MEDIA    : '',
      d.S_BANDA    != null ? d.S_BANDA    : '',
      d.N_ASSIN_A  != null ? d.N_ASSIN_A  : '',
      d.N_ASSIN_S  != null ? d.N_ASSIN_S  : '',
      d.Dias_Ausencia   != null ? d.Dias_Ausencia   : '',
      d.Dias_Rendimento != null ? d.Dias_Rendimento : '',
      d.Respostas  != null ? d.Respostas  : ''
    ];
  }

  // ── CAARS · Conners' Adult ADHD Rating Scales (v120.0) ──────────────────
  // Ordem das colunas idêntica à de HEADERS['CAARS_SL'] (21) e HEADERS['CAARS_OL']
  // (22) — validada por posição. As duas formas partilham a mesma chave de cotação;
  // só os campos de contexto diferem (Contexto na S:L; TempoContacto e
  // ContextoObservacao na O:L).
  // ⚠ Guarda != null OBRIGATÓRIA: neste instrumento o ZERO é um resultado legítimo e
  //   clinicamente informativo —
  //     RB_x = 0 → nenhum sintoma referenciado nessa escala;
  //     Inconsistencia = 0 → concordância perfeita nos 8 pares de itens equivalentes.
  //   (x||'') converteria ambos os casos em célula vazia, isto é, faria um protocolo
  //   perfeitamente válido parecer um protocolo sem dados.
  // ⚠ SEM colunas de T-score ou percentil: as tabelas normativas são propriedade da
  //   MHS. A conversão RB → T faz-se nas folhas de perfil oficiais, pelo sexo e idade
  //   da PESSOA AVALIADA (nunca do observador), e é introduzida manualmente no painel
  //   clínico de cada questionário.
  // ⚠ Na forma O:L a coluna 'Informante' recebe a RELAÇÃO com a pessoa avaliada
  //   (Cônjuge · Progenitor · Irmão(ã) · Outro); na S:L recebe sempre 'Auto-relato'.
  //   É esse campo, com o nome, que sustenta a chave de dedupe de 4 elementos.
  // ⚠ Respostas guarda {"1".."66"} com o valor BRUTO 0–3. É a fonte de verdade da
  //   cotação: o painel clínico recalcula sempre os RB a partir deste campo.
  if (abaNome === 'CAARS_SL' || abaNome === 'CAARS_OL') {
    var caarsVal_ = function (a, b) {
      if (a !== undefined && a !== null && a !== '') return a;
      if (b !== undefined && b !== null && b !== '') return b;
      return '';
    };
    var caarsNum_ = function (x) {
      if (x === undefined || x === null || x === '') return '';
      var n = Number(x);
      return isNaN(n) ? '' : n;   // o 0 é preservado como 0
    };
    var _caarsResp = (typeof d.Respostas === 'string' && d.Respostas)
                   ? d.Respostas
                   : JSON.stringify(d.respostas || d.answers || {});
    var _caarsCabeca = [
      hoje,
      caarsVal_(d.patientCode, d.codigo || d.Código || cod),
      caarsVal_(d.nomeAvaliado || d.NomeAvaliado, d.nomeCrianca || d.NomeCriança || nome),
      caarsVal_(d.sexo || d.Sexo, d.genero || d.Género),
      caarsNum_(d.idade !== undefined ? d.idade : d.Idade),
      caarsVal_(d.grupoNormativo || d.GrupoNormativo, '')
    ];
    var _caarsResp2 = [
      caarsVal_(d.informante || d.Informante, d.relacao || d.Relacao || d['Relação']),
      caarsVal_(d.nome_informante || d.nomeInformante || d.NomeInformante, d.nome_preenche)
    ];
    var _caarsCtx = (abaNome === 'CAARS_SL')
      ? [ caarsVal_(d.contexto || d.Contexto, '') ]
      : [ caarsVal_(d.tempoContacto || d.TempoContacto, ''),
          caarsVal_(d.contextoObservacao || d.ContextoObservacao, '') ];
    var _caarsRB = [
      caarsNum_(d.RB_A !== undefined ? d.RB_A : d.rb_A),
      caarsNum_(d.RB_B !== undefined ? d.RB_B : d.rb_B),
      caarsNum_(d.RB_C !== undefined ? d.RB_C : d.rb_C),
      caarsNum_(d.RB_D !== undefined ? d.RB_D : d.rb_D),
      caarsNum_(d.RB_E !== undefined ? d.RB_E : d.rb_E),
      caarsNum_(d.RB_F !== undefined ? d.RB_F : d.rb_F),
      caarsNum_(d.RB_G !== undefined ? d.RB_G : d.rb_G),
      caarsNum_(d.RB_H !== undefined ? d.RB_H : d.rb_H)
    ];
    var _caarsFim = [
      caarsNum_(d.inconsistencia !== undefined ? d.inconsistencia : d.Inconsistencia),
      caarsVal_(d.leituraInconsistencia || d.LeituraInconsistencia, ''),
      caarsNum_(d.itensRespondidos !== undefined ? d.itensRespondidos : d.ItensRespondidos),
      _caarsResp
    ];
    return _caarsCabeca
      .concat(_caarsResp2)
      .concat(_caarsCtx)
      .concat(_caarsRB)
      .concat(_caarsFim);
  }

  // ── BRIEF-A · Autorrelato e Informante (v116.0) ─────────────────────────
  // Ordem das 25 colunas idêntica à de HEADERS['BRIEF_A_AUTO'] e
  // HEADERS['BRIEF_A_INF'] — cabeçalho único partilhado, validado por posição.
  // ⚠ Guarda != null OBRIGATÓRIA nos indicadores de validade: neste instrumento o
  //   ZERO é um resultado legítimo e clinicamente informativo —
  //     INFREQ = 0 → nenhum item improvável respondido na direcção atípica;
  //     INCONS = 0 → concordância perfeita nos 10 pares de itens equivalentes.
  //   (x||'') converteria ambos os casos em célula vazia, isto é, faria um protocolo
  //   perfeitamente válido parecer um protocolo sem dados.
  //   As nove escalas e os três índices têm mínimo igual ao número de itens (nunca 0),
  //   mas usam a mesma guarda por coerência e para resistir a payloads parciais.
  // ⚠ SEM colunas de T-score ou percentil: por decisão clínica o instrumento recolhe
  //   apenas pontuações brutas e a conversão normativa é feita manualmente.
  if (abaNome === 'BRIEF_A_AUTO' || abaNome === 'BRIEF_A_INF') {
    var _bA = function (v) { return (v === undefined || v === null) ? '' : v; };
    var _bResp = (typeof d.Respostas === 'string') ? d.Respostas
               : JSON.stringify(d.respostas || d.Respostas || d.answers || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeAvaliado || d.NomeAvaliado || d.nomeCrianca || d.NomeCriança || nome || '',
      d.dob || d.DataNasc || '',
      _bA(d.idade != null ? d.idade : d.Idade),
      d.genero || d.Género || d.gender || '',
      d.escolaridade || d.Escolaridade || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.relacao || d.Relacao || d['Relação'] || '',
      _bA(d.INIB  != null ? d.INIB  : d.inib),
      _bA(d.FLEX  != null ? d.FLEX  : d.flex),
      _bA(d.CE    != null ? d.CE    : d.ce),
      _bA(d.AUTOM != null ? d.AUTOM : d.autom),
      _bA(d.BRI   != null ? d.BRI   : d.bri),
      _bA(d.INIC  != null ? d.INIC  : d.inic),
      _bA(d.MT    != null ? d.MT    : d.mt),
      _bA(d.PO    != null ? d.PO    : d.po),
      _bA(d.MTAR  != null ? d.MTAR  : d.mtar),
      _bA(d.OM    != null ? d.OM    : d.om),
      _bA(d.MI    != null ? d.MI    : d.mi),
      _bA(d.GEC   != null ? d.GEC   : d.gec),
      _bA(d.INFREQ != null ? d.INFREQ : d.infreq),
      _bA(d.INCONS != null ? d.INCONS : d.incons),
      _bA(d.NRespondidos != null ? d.NRespondidos : d.nRespondidos),
      _bResp
    ];
  }

  // ── PSWQ · Penn State Worry Questionnaire (v115.0) ──────────────────────
  // Ordem das 34 colunas idêntica à de HEADERS['PSWQ'] — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA em toda a linha: neste instrumento o ZERO e os
  //   valores NEGATIVOS são resultados legítimos —
  //     PSWQ_Z_Com = 0 → resultado exactamente na média comunitária portuguesa;
  //     PSWQ_Z_* < 0 → abaixo da média (a norma clínica devolve z negativo na
  //       generalidade dos protocolos comunitários);
  //     PSWQ_Coerencia = 0 → coerência máxima entre os dois blocos;
  //     PSWQ_Omissoes = 0 → protocolo completo (distinto de «sem dados»).
  //   (x||'') converteria todos estes casos em célula vazia.
  // ⚠ PSWQ_Estado pode chegar como 'NÃO INTERPRETÁVEL (n omissões)' — é gravado tal e
  //   qual, e nesse caso as colunas de resultado chegam vazias por decisão do próprio
  //   questionário (regra D-05: 3 ou mais omissões invalidam o protocolo).
  // ⚠ A coluna Idade é a idade de QUEM RESPONDE, não a da criança do processo: é essa
  //   que determina a aplicabilidade das normas (validadas para ≥ 18 anos).
  // ⚠ Respostas guarda {I1..I16} com o valor BRUTO 1–5, antes da inversão dos itens
  //   1, 3, 8, 10 e 11. É a fonte de verdade da cotação.
  if (abaNome === 'PSWQ') {
    var _npsq = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    var _gpsq = function(k) {
      if (d[k] !== undefined) return d[k];
      var s = k.replace('PSWQ_', '');
      if (d[s] !== undefined) return d[s];
      if (d[k.toLowerCase()] !== undefined) return d[k.toLowerCase()];
      return d[s.toLowerCase()];
    };
    return [
      hoje,
      cod,
      d.nomeCrianca || d.NomeCrianca || d.nomeUtente || d.NomeUtente || nome,
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || d.relacao || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      _npsq(d.idade != null ? d.idade : d.Idade),
      d.momento || d.Momento || '',
      d.contexto || d.Contexto || '',
      _npsq(_gpsq('PSWQ_Total')),
      _npsq(_gpsq('PSWQ_Media')),
      _npsq(_gpsq('PSWQ_F1')),
      _npsq(_gpsq('PSWQ_F2b')),
      _npsq(_gpsq('PSWQ_F2c')),
      _npsq(_gpsq('PSWQ_Z_Com')),
      _npsq(_gpsq('PSWQ_Pct_Com')),
      d.PSWQ_Banda || d.Banda || d.banda || '',
      _npsq(_gpsq('PSWQ_Z_Cli')),
      _npsq(_gpsq('PSWQ_Pct_Cli')),
      _npsq(_gpsq('PSWQ_Z_Fre')),
      _npsq(_gpsq('PSWQ_Pct_Fre')),
      _npsq(_gpsq('PSWQ_Z_EUA')),
      _npsq(_gpsq('PSWQ_Pct_EUA')),
      _npsq(_gpsq('PSWQ_Z_PAG')),
      _npsq(_gpsq('PSWQ_Pct_PAG')),
      _npsq(_gpsq('PSWQ_Z_F1')),
      _npsq(_gpsq('PSWQ_Pct_F1')),
      _npsq(_gpsq('PSWQ_Z_F2b')),
      _npsq(_gpsq('PSWQ_Pct_F2b')),
      _npsq(_gpsq('PSWQ_Coerencia')),
      d.PSWQ_CriterioC || d.CriterioC || d.criterioC || '',
      _npsq(_gpsq('PSWQ_Omissoes')),
      d.PSWQ_Estado || d.Estado || d.estado || '',
      d.Respostas || d.respostas || ''
    ];
  }

  // ── BAI · Inventário de Ansiedade de Beck (v114.0) ──────────────────────
  // Ordem das 14 colunas idêntica à de HEADERS['BAI'] — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA em toda a linha: neste instrumento o ZERO é um
  //   resultado clínico legítimo e frequente —
  //     BAI_Total = 0 → nenhum sintoma de ansiedade endossado (banda «Mínima»);
  //     BAI_SUBJ / BAI_NEURO / BAI_AUTON / BAI_PANICO = 0 → agrupamento sem endosso,
  //       que num perfil com outros agrupamentos elevados é informação de padrão.
  //   (x||'') converteria todos estes casos em célula vazia.
  if (abaNome === 'BAI') {
    var _nbai = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    var _gbai = function(k) { return d[k] !== undefined ? d[k] : d[k.toLowerCase()]; };
    return [
      hoje,
      cod,
      d.nomeCrianca || d.NomeCrianca || d.nomeAvaliado || nome,
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || '',
      _nbai(d.idade != null ? d.idade : d.Idade),
      d.sexo || d.Sexo || '',
      _nbai(_gbai('BAI_Total')),
      d.BAI_Class || d.bai_class || '',
      _nbai(_gbai('BAI_SUBJ')),
      _nbai(_gbai('BAI_NEURO')),
      _nbai(_gbai('BAI_AUTON')),
      _nbai(_gbai('BAI_PANICO')),
      d.Respostas || d.respostas || ''
    ];
  }

  // ── BDI-II · Inventário de Depressão de Beck II (v114.0) ────────────────
  // Ordem das 13 colunas idêntica à de HEADERS['BDI2'] — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA em toda a linha: o ZERO é resultado legítimo —
  //     BDI_Total = 0 → nenhum sintoma depressivo endossado (banda «Mínima»);
  //     BDI_COG = 0 ou BDI_SOM = 0 → dimensão sem endosso, informação de configuração;
  //     BDI_Item9 = 0 → AUSÊNCIA de ideação suicida, que é exactamente a informação
  //       clínica a registar e é distinta de «sem dados» (célula vazia).
  //   (x||'') apagaria o zero do item 9 e tornaria indistinguíveis os dois estados.
  // ⚠ A coluna Respostas guarda {opcao, score} por item, e não apenas a pontuação:
  //   nos grupos 16 (sono) e 18 (apetite), com 7 opções cotadas 0-1-1-2-2-3-3, a
  //   pontuação não permite recuperar a frase assinalada («Durmo muito mais» e
  //   «Durmo muito menos» valem ambas 2 e são clinicamente opostas).
  if (abaNome === 'BDI2') {
    var _nbdi = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    var _gbdi = function(k) { return d[k] !== undefined ? d[k] : d[k.toLowerCase()]; };
    return [
      hoje,
      cod,
      d.nomeCrianca || d.NomeCrianca || d.nomeAvaliado || nome,
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || '',
      _nbdi(d.idade != null ? d.idade : d.Idade),
      d.sexo || d.Sexo || '',
      _nbdi(_gbdi('BDI_Total')),
      d.BDI_Class || d.bdi_class || '',
      _nbdi(_gbdi('BDI_COG')),
      _nbdi(_gbdi('BDI_SOM')),
      _nbdi(_gbdi('BDI_Item9')),
      d.Respostas || d.respostas || ''
    ];
  }

  // ── SIAS · SPS · Escalas de Ansiedade Social (v113.0) ────────────────────
  // Ordem das 20 colunas idêntica à de HEADERS['SIAS_SPS'] — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA em toda a linha: neste instrumento o ZERO é um
  //   resultado descritivo legítimo —
  //     SIAS_Media = 0 / SPS_Media = 0 → nenhum item endossado;
  //     Contraste = 0 → as duas médias coincidem (padrão de leitura previsto);
  //     Contraste < 0 → média de interação superior à de escrutínio (padrão atípico);
  //     SIAS_Total = 0 é impossível (itens 8 e 10 invertidos dão sempre ≥ 8), mas
  //     SPS_Total = 0 e os contadores de omissos a 0 são correntes.
  //   (x||'') converteria todos estes casos em célula vazia.
  // ⚠ Escala «não interpretável» (mais de 2 omissos) chega como a string 'n.i.' e é
  //   gravada tal e qual — NUNCA convertida em 0.
  if (abaNome === 'SIAS_SPS') {
    var _nss = function(a) { return (a !== null && a !== undefined) ? a : ''; };
    var _gss = function(k) { return d[k] !== undefined ? d[k] : d[k.toLowerCase()]; };
    return [
      hoje,
      cod,
      d.nomeAvaliado || d.NomeAvaliado || nome,
      _nss(d.idade != null ? d.idade : d.Idade),
      d.informante || d.Informante || '',
      d.nomeInformante || d.NomeInformante || d.nome_informante || '',
      _nss(_gss('SIAS_Respondidos')), _nss(_gss('SIAS_Omissos')),
      _nss(_gss('SIAS_Total')),       _nss(_gss('SIAS_Media')),
      d.SIAS_Estado || d.sias_estado || '',
      _nss(_gss('SPS_Respondidos')),  _nss(_gss('SPS_Omissos')),
      _nss(_gss('SPS_Total')),        _nss(_gss('SPS_Media')),
      d.SPS_Estado || d.sps_estado || '',
      _nss(_gss('Contraste')),
      d.Pos_SIAS || d.pos_sias || '',
      d.Pos_SPS  || d.pos_sps  || '',
      d.Respostas || d.respostas || ''
    ];
  }

  // ── GCSA · Grelha de Caracterização da Seletividade Alimentar (v111.0) ───
  // Ordem das 67 colunas idêntica à de HEADERS['GCSA'] — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA em toda a linha: neste instrumento o ZERO é um
  // resultado descritivo legítimo, não uma ausência de dado —
  //   ID = 0 e IS = 0 → subdimensão sem indicadores registados;
  //   CFG_Zeros = 15 → todos os domínios preservados;
  //   CFG_Amplitude = 0 → perfil sem diferenciação entre domínios;
  //   MCOMP_Pres = 0 → nenhum sintoma de mastigação relatado.
  // (x||'') converteria todos estes casos em célula vazia e apagaria a informação.
  // ⚠ Subdimensão «Não interpretável» (omissos acima do limiar de 20 %, D-06) chega
  //   como string vazia e é gravada tal e qual — NUNCA convertida em 0. A distinção
  //   entre «sem indicadores» (0) e «não interpretável» (vazio) é clínica.
  if (abaNome === 'GCSA') {
    var _gc  = function(k) { return d[k] !== undefined ? d[k] : d[k.toLowerCase()]; };
    var _ngc = function(a) { return (a !== null && a !== undefined) ? a : ''; };
    var _lgc = [ hoje, cod, nome,
                 d.dataNasc || d.DataNasc || d.dob || '',
                 _ngc(d.idade != null ? d.idade : d.Idade),
                 d.informante || d.Informante || '',
                 d.nomeInformante || d.NomeInformante || d.nome_informante || '',
                 d.periodoRegisto || d.PeriodoRegisto || '' ];
    ['3A','3B','3C','4A','4B','4C','6A','6B','7A','7B','8A',
     'ACOP','ACOR','ACOE','ACOC','3D','ACOD'].forEach(function(k){
      _lgc.push(_ngc(_gc('ID_' + k)));
      _lgc.push(_ngc(_gc('IS_' + k)));
    });
    ['MCOMP_Pres','MCOMP_Sal','MSEG_Pres','MSEG_Sal',
     'DFUNC_Pres','DFUNC_Sal','DDIAG_Pres','DDIAG_Sal'].forEach(function(k){
      _lgc.push(_ngc(_gc(k)));
    });
    ['SIN_DEGL','SIN_PICA','SIN_CRESC','SIN_IMAGEM','SIN_AVERS',
     'TRI_08_8','TRI_08_9'].forEach(function(k){
      var v = _gc(k); _lgc.push(v != null ? v : '');
    });
    ['CFG_Interpretaveis','CFG_Superiores','CFG_Zeros',
     'CFG_ISmax','CFG_ISmin','CFG_Amplitude'].forEach(function(k){
      _lgc.push(_ngc(_gc(k)));
    });
    _lgc.push(d.CFG_Predominante || d.cfg_predominante || '');
    _lgc.push(d.Observacoes || d['Observações'] || d.observacoes || '');
    _lgc.push(d.NotasFinais || d.notasFinais || '');
    _lgc.push(d.Respostas || d.respostas || '');
    return _lgc;
  }

  // ── GCSA_Diario · Diário de sete dias (bloco 10, D-03) (v111.0) ──────────
  // Ordem das 21 colunas idêntica à de HEADERS['GCSA_Diario'] — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA: RefRecusa = 0 (semana sem qualquer recusa) e
  //   NucleoEstavel = 0 (nenhum alimento repetido em 4 ou mais dias) são achados
  //   descritivos, não ausências de dado.
  // ⚠ Os rácios (TaxaRecusa, PropNucleo, MediaPorDia) chegam como string vazia quando
  //   não há denominador — diário sem refeições registadas ou sem repertório. Vazio e
  //   zero são estados DIFERENTES e são gravados tal e qual, sem conversão.
  if (abaNome === 'GCSA_Diario') {
    var _gd  = function(k) { return d[k] !== undefined ? d[k] : d[k.toLowerCase()]; };
    var _ngd = function(a) { return (a !== null && a !== undefined) ? a : ''; };
    var _lgd = [ hoje, cod, nome,
                 d.informante || d.Informante || '',
                 d.nomeInformante || d.NomeInformante || d.nome_informante || '',
                 d.periodoInicio || d.PeriodoInicio || '',
                 d.periodoFim || d.PeriodoFim || '' ];
    ['RefRegistadas','RefRecusa','TaxaRecusa','RefForaCasa',
     'AlimentosDistintos','NucleoEstavel','PropNucleo','MediaPorDia'].forEach(function(k){
      _lgd.push(_ngd(_gd(k)));
    });
    _lgd.push(d.AlimentosPorDia || d.alimentosPorDia || '');
    _lgd.push(d.Dias        || d.dias        || '');
    _lgd.push(d.Refeicoes   || d.refeicoes   || '');
    _lgd.push(d.Repertorio  || d.repertorio  || '');
    _lgd.push(d.NotasFinais || d.notasFinais || '');
    _lgd.push(d.Respostas   || d.respostas   || '');
    return _lgd;
  }

  // ── QRF-C · Questionário de Relação Fraterna, versão criança (v107.0) ────
  // Todas as cotações são MÉDIAS na métrica 1–5 (nunca somas). Escala ou índice
  // não cotável chega do questionário como a string 'n/c' e é gravado tal e qual.
  // ⚠ Guarda != null OBRIGATÓRIA: neste instrumento o ZERO é um resultado
  // clinicamente informativo, não uma ausência de dado —
  //   ESTATUTO = 0  → configuração perfeitamente igualitária entre os irmãos;
  //   DIR_F1/DIR_F2 = 0 e MAG_* = 0 → ausência de parcialidade parental percebida;
  //   RIVALIDADE = 0 → nenhuma figura percebida como parcial;
  //   DP_A = 0 → protocolo INVARIANTE, que é justamente o critério invalidante;
  //   PCT_MEDIO = 0 → nenhuma resposta no ponto médio.
  // (x||'') converteria todos estes casos em célula vazia e apagaria a informação.
  // ── QCF-P · Questionário de Comportamento Fraterno, versão parental (v108.0) ─
  // 1 linha = 1 PROGENITOR × toda a fratria. As colunas F1..F4 são preenchidas pela
  // ordem fixada no cabeçalho do protocolo, que se replica em todos os protocolos
  // parentais da mesma família — não reordenar nem compactar colunas vazias.
  // ⚠ Guarda != null OBRIGATÓRIA: neste instrumento o ZERO é resultado informativo —
  //   DIRECAO_TD = 0 e MAGNITUDE_TD = 0 → tratamento descrito como igual ao dos irmãos;
  //   IndiceSimetria = 0 → descrição indiferenciada entre os filhos, que é justamente
  //     o viés que a estrutura lado a lado existe para expor (D-48);
  //   DesvioEspelho = 0 → descrição internamente coerente (comparações espelhadas).
  // ⚠ '—' (coluna inativa) e 'n/c' (dimensão activa não cotável) são estados
  //   DIFERENTES: ambos chegam como string e são gravados tal e qual, sem conversão.
  // ── CAPS-22 · Perfecionismo, autorrelato da criança (v109.0) ─────────────
  // Ordem das 39 colunas idêntica à de HEADERS['CAPS22'] — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA em toda a linha: neste instrumento o ZERO e os
  // valores NEGATIVOS são resultados legítimos e informativos —
  //   SOP_z / SPP_z negativos → posição abaixo da média normativa (bandas 1 e 2);
  //   SOP_Banda = 1 → marcadamente abaixo do esperado;
  //   Omissões_SOP = 0 e Omissões_SPP = 0 → protocolo completo;
  //   R_SOP / R_SPP = 0 → padrão perfeitamente coerente nos itens invertidos, que é
  //     justamente o resultado que valida o protocolo.
  // (x||'') converteria todos estes casos em célula vazia e apagaria a informação.
  // ⚠ O índice pode chegar como a string 'INVÁLIDO' (mais de 2 omissões na subescala)
  //   e é gravado tal e qual — nunca convertido em 0 nem em vazio.
  // ── PDRA-9 · ambas as formas (v110.0) ────────────────────────────────────
  // ⚠ Guarda != null OBRIGATÓRIA: neste instrumento o ZERO é resultado legítimo —
  //   S_IE = 0 significa endossamento nulo da dimensão, não ausência de dado, e
  //   Omissões = 0 significa protocolo completo. Um padrão (x||'') apagá-los-ia.
  //   Dimensão invalidada por omissão chega como string vazia e é gravada tal e qual,
  //   NUNCA convertida em 0 — não há prorrateio neste instrumento.
  if (abaNome === 'PDRA9_C' || abaNome === 'PDRA9_P') {
    var _num9 = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    var _g9   = function(k) { return d[k] !== undefined ? d[k] : d[k.toLowerCase()]; };
    var _l9 = [ hoje, cod, nome,
                _num9(d.idade != null ? d.idade : d.Idade),
                d.forma || d.Forma || (abaNome === 'PDRA9_C' ? 'C' : 'P'),
                d.informante || d.Informante || '',
                d.nomeInformante || d.NomeInformante || d.nome_informante || '',
                d.momento || d.Momento || '' ];
    ['S_bruto','A_bruto','R_bruto','S_IE','A_IE','R_IE'].forEach(function(k){
      _l9.push(_num9(_g9(k)));
    });
    ['S_Banda','A_Banda','R_Banda','S_Saliente','A_Saliente','R_Saliente'].forEach(function(k){
      var v = _g9(k); _l9.push(v != null ? v : '');
    });
    _l9.push(_num9(_g9('nSalientes')));
    _l9.push(_num9(_g9('Delta')));
    _l9.push(d.Configuracao || d['Configuração'] || d.configuracao || '');
    _l9.push(d.Dominancia || d['Dominância'] || d.dominancia || '');
    _l9.push(_num9(_g9('Total')));
    _l9.push(d.Validade || d.validade || '');
    _l9.push(_num9(_g9('Omissoes') != null ? _g9('Omissoes') : d['Omissões']));
    _l9.push(d.ItensOmissos || d.itensOmissos || '');
    _l9.push(d.Respostas || d.answers || '');
    return _l9;
  }

  if (abaNome === 'CAPS22') {
    var _numK = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    return [ hoje, cod, nome,
             d.sexo || d.Sexo || d.genero || d.gender || '',
             _numK(d.idade != null ? d.idade : d.Idade),
             d.informante || d.Informante || 'Criança',
             d.nome_informante || d.nomeInformante || d.NomeInformante || '',
             d.administracao || d.Administracao || d['Administração'] || '',
             _numK(d.SOP), _numK(d.SPP), _numK(d.Total),
             _numK(d.SOP_z), _numK(d.SOP_T), _numK(d.SOP_Pct), _numK(d.SOP_Banda),
             d.SOP_Descritor || '',
             _numK(d.SPP_z), _numK(d.SPP_T), _numK(d.SPP_Pct), _numK(d.SPP_Banda),
             d.SPP_Descritor || '',
             _numK(d.SOP_z_Mista), _numK(d.SOP_Banda_Mista),
             _numK(d.SPP_z_Mista), _numK(d.SPP_Banda_Mista),
             _numK(d.SOP_Prorrateado), _numK(d.SPP_Prorrateado), _numK(d.SOP_Prorrateado_4),
             _numK(d.SOP_SF), _numK(d.SPP_SF),
             _numK(d.R_SOP), _numK(d.R_SPP),
             d.Class_R_SOP || '', d.Class_R_SPP || '',
             d.Validade || '', d.Configuracao || d['Configuração'] || '',
             _numK(d.Omissoes_SOP != null ? d.Omissoes_SOP : d['Omissões_SOP']),
             _numK(d.Omissoes_SPP != null ? d.Omissoes_SPP : d['Omissões_SPP']),
             d.Respostas || d.answers || '' ];
  }

  // ── CAPS-PR · Perfecionismo da criança, heterorrelato parental (v109.0) ──
  // Ordem das 20 colunas idêntica à de HEADERS['CAPS_PR'] — validada por posição.
  // ⚠ Guarda != null OBRIGATÓRIA: z negativos e bandas 1–2 são resultados legítimos.
  // ⚠ 'Informante' (Mãe/Pai/Outro cuidador) + 'NomeInformante' são o discriminante de
  //   dedupe: sem ambos preenchidos, a submissão do segundo progenitor sobrescreveria
  //   a do primeiro e perder-se-ia a comparação entre informantes.
  if (abaNome === 'CAPS_PR') {
    var _numR = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    return [ hoje, cod, nome,
             d.sexo || d.Sexo || d.genero || d.gender || '',
             _numR(d.idade != null ? d.idade : d.Idade),
             d.informante || d.Informante || d.relacao || d.Relacao || '',
             d.nome_informante || d.nomeInformante || d.NomeInformante || '',
             _numR(d.SPP_PR), _numR(d.SOP_PR),
             _numR(d.Total_PR != null ? d.Total_PR : d.TOT_PR),
             _numR(d.SPP_PR_z), _numR(d.SPP_PR_Banda), _numR(d.SPP_PR_POMP),
             _numR(d.SOP_PR_z), _numR(d.SOP_PR_Banda), _numR(d.SOP_PR_POMP),
             _numR(d.TOT_PR_z), _numR(d.TOT_PR_Banda), _numR(d.TOT_PR_POMP),
             d.Respostas || d.answers || '' ];
  }

  if (abaNome === 'QCFP') {
    var _numP = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    var _linhaP = [ hoje, cod, nome,
                    d.informante || d.Informante || d.relacao || d.Relacao || '',
                    d.nome_informante || d.nomeInformante || d.NomeInformante || '',
                    d.resideCom || d.ResideCom || d.reside_com || '',
                    d.emparelhamento || d.Emparelhamento || '',
                    d.relacaoReferencia || d.RelacaoReferencia || d.relacao_referencia || '',
                    d.irmaoReferencia || d.IrmaoReferencia || d.irmao_referencia || '',
                    d.momento || d.Momento || '',
                    _numP(d.nFilhos != null ? d.nFilhos : d.NFilhos),
                    d.filhos || d.Filhos || '',
                    d.validadeProtocolo || d.ValidadeProtocolo || '',
                    _numP(d.colunasAtivas != null ? d.colunasAtivas : d.ColunasAtivas),
                    _numP(d.colunasInterpretaveis != null ? d.colunasInterpretaveis : d.ColunasInterpretaveis),
                    _numP(d.indiceSimetria != null ? d.indiceSimetria : d.IndiceSimetria),
                    d.dimensaoMaiorAmplitude || d.DimensaoMaiorAmplitude || '',
                    _numP(d.desvioEspelho != null ? d.desvioEspelho : d.DesvioEspelho),
                    d.perfilFratria || d.PerfilFratria || '' ];
    var _campoP = ['Nome','Validade','COMP','EMP','ENS','RIV','AGR','EVIT',
                   'DIRECAO_TD','MAGNITUDE_TD','PERCECAO','LEGITIMIDADE'];
    for (var iP = 1; iP <= 4; iP++) {
      for (var jP = 0; jP < _campoP.length; jP++) {
        _linhaP.push(_numP(d['F' + iP + '_' + _campoP[jP]]));
      }
    }
    _linhaP.push(d.Respostas || d.answers || '');
    return _linhaP;
  }

  if (abaNome === 'QRFC') {
    var _numQ = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    var _linhaQ = [ hoje, cod, nome,
                    _numQ(d.idade || d.Idade),
                    d.nomeIrmao || d.NomeIrmao || d.nome_irmao || '',
                    _numQ(d.idadeIrmao || d.IdadeIrmao || d.idade_irmao),
                    d.codigoDiade || d.CodigoDiade || d.codigo_diade || '',
                    d.figura1 || d.Figura1 || '',
                    d.figura2 || d.Figura2 || '',
                    d.momento || d.Momento || '',
                    d.informante || d.Informante || '',
                    d.nome_informante || d.nomeInformante || d.NomeInformante || '' ];
    for (var iQ = 1; iQ <= 17; iQ++) _linhaQ.push(_numQ(d['E' + iQ]));
    var _idxQ = ['CALOR','CONFLITO','POLO_PROPRIO','POLO_IRMAO','ESTATUTO','INTENSIDADE',
                 'DIR_F1','MAG_F1','DIR_F2','MAG_F2',
                 'RIVALIDADE','RIV_MEDIA','CONFIG_PARC','ASSIM_INTERPAR',
                 'LEGIT_F1','LEGIT_F2','SATISFACAO','IMPORTANCIA',
                 'DP_A','MEDIA_A','PCT_MEDIO','SINALIZACAO','ITENS_RESP','VALIDADE'];
    for (var jQ = 0; jQ < _idxQ.length; jQ++) _linhaQ.push(_numQ(d[_idxQ[jQ]]));
    _linhaQ.push(d.Respostas || d.answers || '');
    return _linhaQ;
  }

  // ── CBQ-SF · Children's Behavior Questionnaire, Forma Breve (v106.0) ──────
  // Todas as cotações são MÉDIAS na métrica 1–7 (nunca somas) e chegam já formatadas
  // com 2 casas decimais pelo questionário. Escala/dimensão não cotada chega como ''.
  // ⚠ Guarda != null obrigatória: PctOmissos = 0 (protocolo completo) e Invariancia = 0
  // são resultados legítimos que (x||'') converteria silenciosamente em célula vazia.
  if (abaNome === 'CBQ_SF') {
    var _numC = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    var _escC = ['NA','IF','AE','FA','DE','SLR','ME','EIP','IM','CI','BIP','SP','TR','TI','SG'];
    var _dimC = ['MA_EXT','MA_AN','MA_CE','MA_EXT4','MB_EXT','MB_AN','MB_CE'];
    var _linhaC = [ hoje, cod, nome,
                    d.dataNasc || d.DataNasc || d.dob || '',
                    d.sexo || d.Sexo || d.genero || d.gender || '',
                    _numC(d.idade || d.Idade),
                    d.informante || d.Informante || d.relacao || d.Relacao || '',
                    d.nome_informante || d.nomeInformante || d.NomeInformante || '',
                    d.ValidadeProtocolo || d.validadeProtocolo || '',
                    _numC(d.PctOmissos      != null ? d.PctOmissos      : d.pctOmissos),
                    _numC(d.NEscalasValidas != null ? d.NEscalasValidas : d.nEscalasValidas),
                    _numC(d.DP_Respostas    != null ? d.DP_Respostas    : d.dpBrutos),
                    _numC(d.Invariancia     != null ? d.Invariancia     : d.invariancia),
                    d.PadraoResposta || d.padraoResposta || '' ];
    for (var iC = 0; iC < _escC.length; iC++) _linhaC.push(_numC(d['M_' + _escC[iC]]));
    for (var jC = 0; jC < _dimC.length; jC++) _linhaC.push(_numC(d['D_' + _dimC[jC]]));
    _linhaC.push(d.EscalasInvalidas || d.escalasInvalidas || '');
    _linhaC.push(d.Respostas || d.answers || '');
    return _linhaC;
  }

  // ── SMQ · Versão Pais (v104.0) ──────────────────────────────────────────
  // ⚠ ESCALA INVERSA: média 0,00 significa ausência total de fala — é o resultado
  // clínico MAIS grave possível e tem de chegar ao Sheet como 0, não como vazio.
  // Por isso NUNCA usar (x||'') aqui: (0||'') devolve '' e apagaria o caso mais severo.
  if (abaNome === 'SMQ_Pais') {
    var _numS = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    return [ hoje, cod, nome, d.idade||'',
             d.nome_informante||d.nomeInformante||d.NomeInformante||'',
             d.relacao||d.Relacao||d.respondente||'',
             _numS(d.Media_Escola),  d.Estado_Escola||'',
             _numS(d.Media_Casa),    d.Estado_Casa||'',
             _numS(d.Media_Social),  d.Estado_Social||'',
             _numS(d.Media_Total),   d.Estado_Total||'',
             _numS(d.Soma_Sintomas), d.Rastreio||'',
             _numS(d.Media_Interf_Crianca), _numS(d.Media_Desc_Crianca),
             _numS(d.Media_Desc_Cuidador),  _numS(d.Media_Interf_Global),
             _numS(d.Soma_Interferencia),
             _numS(d.IDC), _numS(d.Disc_Social_Escola),
             _numS(d.NA_Itens), _numS(d.Omissos), d.Respostas||d.answers||'' ];
  }

  // ── SMQ · Versão Professores (v104.0) ───────────────────────────────────
  if (abaNome === 'SMQ_Prof') {
    var _numT = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    return [ hoje, cod, nome, d.idade||'', d.ano||d.anoEscolaridade||'',
             d.nome_informante||d.nomeInformante||d.NomeInformante||'',
             d.relacao||d.Relacao||d.funcao||'',
             _numT(d.Media_Escola_Prof), d.Estado_Escola_Prof||'',
             _numT(d.Soma_Escola_Prof),  d.Banda_Escola_Prof||'',
             _numT(d.Media_Interf_Prof), d.Estado_Interf_Prof||'',
             _numT(d.Media_Desc_Aluno),  _numT(d.Media_Desc_Prof),
             _numT(d.Omissos), d.Respostas||d.answers||'' ];
  }

  // ── QCVE-P · Comportamento Verbal em Contexto Escolar — Professor (v105.0) ─
  // ⚠ ESCALA INVERSA: ECV 0,00 significa ausência total de fala na escola — é o
  // resultado clínico MAIS grave do instrumento e tem de chegar ao Sheet como 0.
  // Por isso NUNCA usar (x||'') nos numéricos: (0||'') devolve '' e apagaria
  // precisamente o caso mais severo.
  if (abaNome === 'QCVEP_PROF') {
    // Decimal em texto com vírgula: impede a coerção para data na locale pt-PT.
    var _decQ = function(a) {
      if (a === null || a === undefined || a === '') return '';
      var n = Number(a);
      return isNaN(n) ? String(a) : n.toFixed(2).replace('.', ',');
    };
    var _numQ = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    return [ hoje, cod, nome,
             d.dataNasc||d.DataNasc||'', d.idade||'',
             d.anoEscolaridade||d.ano||'', d.escola||'',
             d.informante||d.funcao||d.Informante||'',
             d.nome_informante||d.nomeInformante||d.NomeInformante||'',
             d.momentoAvaliacao||d.momento||'',
             _numQ(d.temposSemana), _numQ(d.mesesConhece), _numQ(d.duracaoMeses),
             d.modoInicio||'', d.linguaMaterna||'', d.linguaEscolaridade||'',
             d.ambasLinguas||'', d.alteracaoContexto||'', d.acontecimentoAdverso||'',
             d.falaCom||'', d.naoFalaCom||'', d.observacoes||'',
             _decQ(d.E1_Media), d.E1_Estatuto||'',
             _decQ(d.E2_Media), d.E2_Estatuto||'',
             _decQ(d.E3_Media), d.E3_Estatuto||'',
             _decQ(d.ECV_Total), d.ECV_Estatuto||'', _decQ(d.IRV),
             _numQ(d.SomaBruta), _numQ(d.SO_Total),
             _decQ(d.ICNV_Media), d.ICNV_Estatuto||'',
             _decQ(d.IIF_Media),  d.IIF_Estatuto||'',
             d.Banda_ECV||'', d.Banda_ICNV||'', d.Banda_IIF||'',
             d.Configuracao||'', d.Gradiente||'', d.Discrepancia||'',
             d.Integridade||'',
             d.Respostas||d.answers||'' ];
  }

  if (abaNome === 'TAS20') {
    return [ hoje, d.patientCode||d.codigo||'', d.patientName||d.nome||'',
             d.total||'', d.dif||'', d.ddf||'', d.eot||'',
             d.classification||d.classificacao||'', d.answers||'' ];
  }

  if (abaNome === 'CBCL_618') {
    // v95 — brutos. NUNCA (x||'') num bruto: 0 é válido e (0||'') devolve ''.
    var _rwC = function(a) { return (a !== null && a !== undefined && a !== '') ? a : ''; };
    return [ hoje, cod, nome, d.idade||'', d.sexo||'', d.grupoIdade||'',
             d.preenchidoPor||d.nomeInquirido||'',
             d.tInternalizacao||'', d.tExternalizacao||'', d.tTotal||'',
             d.tI||'', d.tII||'', d.tIII||'', d.tIV||'',
             d.tV||'', d.tVI||'', d.tVII||'', d.tVIII||'',
             _rwC(d.rawTotal), d.answers||'',
             _rwC(d.rawInternalizacao), _rwC(d.rawExternalizacao),
             _rwC(d.rawI), _rwC(d.rawII), _rwC(d.rawIII), _rwC(d.rawIV),
             _rwC(d.rawV), _rwC(d.rawVI), _rwC(d.rawVII), _rwC(d.rawVIII) ];
  }

  if (abaNome === 'TRF_618') {
    var sc = d.scores||{}; var ts = sc.tScores||{};
    // v96 — brutos. NUNCA (x||'') num bruto: 0 é válido e (0||'') devolve ''.
    var _rwT = function(a, b) {
      if (a !== null && a !== undefined && a !== '') return a;
      return (b !== null && b !== undefined) ? b : '';
    };
    var _sr = sc.scaleRaws || {};
    return [ hoje, cod, nome, d.idade||'', d.sexo||'', d.grupoIdade||'',
             d.nomeInquirido||d.preenchidoPor||'',
             ts.INT||'', ts.EXT||'', ts.TOT||'',
             ts.I||'', ts.II||'', ts.III||'', ts.IV||'',
             ts.V||'', ts.VI||'', ts.VII||'', ts.VIII||'',
             d.mainConcern||'', d.strengths||'', d.answers||'',
             _rwT(d.rawInternalizacao, sc.intRaw),
             _rwT(d.rawExternalizacao, sc.extRaw),
             _rwT(d.rawTotal,          sc.totRaw),
             _rwT(d.rawI,   _sr.I),   _rwT(d.rawII,  _sr.II),
             _rwT(d.rawIII, _sr.III), _rwT(d.rawIV,  _sr.IV),
             _rwT(d.rawV,   _sr.V),   _rwT(d.rawVI,  _sr.VI),
             _rwT(d.rawVII, _sr.VII), _rwT(d.rawVIII,_sr.VIII),
             _rwT(d.rawDesatencao,     sc.desatRaw),
             _rwT(d.rawHiperatividade, sc.hiRaw) ];
  }

  if (abaNome === 'YSR_1118') {
    var sc3=d.scores||{}; var scales=sc3.scales||{};
    // v94 — brutos. NUNCA usar (x||'') aqui: um bruto 0 é um valor válido e
    // (0||'') devolve string vazia. Daí o teste explícito a null/''.
    var _rw = function(a, b) {
      if (a !== null && a !== undefined && a !== '') return a;
      return (b !== null && b !== undefined) ? b : '';
    };
    return [ hoje, cod, nome, d.idade||'', d.sexo||'', d.grupoIdade||'',
             d.tInternalizacao||(sc3.INT&&sc3.INT.T)||'',
             d.tExternalizacao||(sc3.EXT&&sc3.EXT.T)||'',
             d.tTotal||(sc3.TOT&&sc3.TOT.T)||'',
             d.tI||(scales.I&&scales.I.T)||'', d.tII||(scales.II&&scales.II.T)||'',
             d.tIII||(scales.III&&scales.III.T)||'', d.tIV||(scales.IV&&scales.IV.T)||'',
             d.tV||(scales.V&&scales.V.T)||'', d.tVI||(scales.VI&&scales.VI.T)||'',
             d.tVII||(scales.VII&&scales.VII.T)||'', d.tVIII||(scales.VIII&&scales.VIII.T)||'',
             typeof d.answers==='string'?d.answers:JSON.stringify(d.answers||''),
             _rw(d.rawInternalizacao, sc3.INT&&sc3.INT.raw),
             _rw(d.rawExternalizacao, sc3.EXT&&sc3.EXT.raw),
             _rw(d.rawTotal,          sc3.TOT&&sc3.TOT.raw),
             _rw(d.rawI,    scales.I&&scales.I.raw),
             _rw(d.rawII,   scales.II&&scales.II.raw),
             _rw(d.rawIII,  scales.III&&scales.III.raw),
             _rw(d.rawIV,   scales.IV&&scales.IV.raw),
             _rw(d.rawV,    scales.V&&scales.V.raw),
             _rw(d.rawVI,   scales.VI&&scales.VI.raw),
             _rw(d.rawVII,  scales.VII&&scales.VII.raw),
             _rw(d.rawVIII, scales.VIII&&scales.VIII.raw),
             _rw(d.rawOutros, sc3.OUT&&sc3.OUT.raw) ];
  }

  if (abaNome === 'CBCL_15') {
    var sc4=d.scores||{};
    return [ hoje, d.codigo||d.patientCode||'', d.nome||d.nomeCrianca||'',
             d.sexo||'', d.informante||'',
             d.nome_informante||d.nomeInformante||d.NomeInformante||'',
             (sc4['Reatividade Emocional']||{}).tscore||'',
             (sc4['Ansiedade/Depressão']||{}).tscore||'',
             (sc4['Queixas Somáticas']||{}).tscore||'',
             (sc4['Retraimento']||{}).tscore||'',
             (sc4['Problemas de Sono']||{}).tscore||'',
             (sc4['Problemas de Atenção']||{}).tscore||'',
             (sc4['Comportamento Agressivo']||{}).tscore||'',
             (sc4['Internalizante']||{}).tscore||'',
             (sc4['Externalizante']||{}).tscore||'',
             (sc4['Total']||{}).tscore||'',
             d.respostas?JSON.stringify(d.respostas):(d.answers||'') ];
  }

  if (abaNome === 'CTRF_15') {
    return [ hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.nome||'',
             d.sexo||'', d.dataNasc||'', d.idade||'',
             d.nomeInformante||d.informante||'', d.habilitacoes||'',
             d.expAnos||'', d.papelInst||'', d.tempoConhece||'',
             d.nomeInst||'', d.tipoInst||'', d.nCriancas||'',
             d.horasSemana||'', d.grauConhecimento||'', d.tratEspecial||'',
             d.doenca||'', d.preocupacao||'', d.melhor||'',
             d.profPai||'', d.profMae||'', d.total||0, d.answers||'', d.item100||'' ];
  }

  if (abaNome === 'LDS') {
    return [ hoje, d.patientCode||d.codigo||'', d.idadeMeses||d.idade||'',
             d.sexo||'', d.prem||'', d.premSemanas||'', d.pesoNasc||'',
             d.otite||'', d.bilingue||'', d.linguas||'',
             d.histFam||'', d.histFamRelacao||'', d.preocup||'',
             d.preocupMotivo||'', d.dizPalavras||'', d.combinaFrases||'',
             d.frases||'', d.mlu||'', d.vocabScore||'', d.vocabItems||'' ];
  }

  if (abaNome === 'SWAN') {
    return [ hoje, d.patientCode||d.codigo||'', d.nomeCrianca||'',
             d.informante||'', d.relacao||'',
             d.scoreDesatencao||'', d.scoreHiperatividade||'',
             d.scoreTotal||'', d.classificacao||'', d.answers||'' ];
  }

  if (abaNome === 'SRS2_IE_Pais') {
    return [ hoje, d.patientCode||'', d.respondente||'', d.sexo||'', d.idade||'',
             d.PERC_raw||'', d.PERC_T||'', d.PERC_pct||'',
             d.COG_raw||'',  d.COG_T||'',  d.COG_pct||'',
             d.COM_raw||'',  d.COM_T||'',  d.COM_pct||'',
             d.MOT_raw||'',  d.MOT_T||'',  d.MOT_pct||'',
             d.PRR_raw||'',  d.PRR_T||'',  d.PRR_pct||'',
             d.CIS_raw||'',  d.CIS_T||'',  d.CIS_pct||'',
             d.TOT_raw||'',  d.TOT_T||'',  d.TOT_pct||'',
             d.classif_total||'', d.respostas||'' ];
  }

  if (abaNome === 'SRS2_IE_Prof') {
    return [ hoje, d.patientCode||'', d.respondente||'', d.sexo||'', d.idade||'',
             d.PERC_raw||'', d.PERC_T||'', d.PERC_pct||'',
             d.COG_raw||'',  d.COG_T||'',  d.COG_pct||'',
             d.COM_raw||'',  d.COM_T||'',  d.COM_pct||'',
             d.MOT_raw||'',  d.MOT_T||'',  d.MOT_pct||'',
             d.PRR_raw||'',  d.PRR_T||'',  d.PRR_pct||'',
             d.CIS_raw||'',  d.CIS_T||'',  d.CIS_pct||'',
             d.TOT_raw||'',  d.TOT_T||'',  d.TOT_pct||'',
             d.classif_total||'', d.respostas||'' ];
  }


  // ── RAADS-R — v37.0 ────────────────────────────────────────
  if (abaNome === 'RAADSR') {
    return [
      hoje,
      d.Codigo     || d.patientCode || d.codigo || '',
      d.PreenchidoPor || d.nome_informante || d.nomeRespondente || '',
      d.Idade      || d.idade  || '',
      d.Genero     || d.genero || '',
      d.Total      !== undefined ? d.Total      : (d.total      !== undefined ? d.total      : ''),
      d.Social     !== undefined ? d.Social     : (d.social     !== undefined ? d.social     : ''),
      d.Linguagem  !== undefined ? d.Linguagem  : (d.linguagem  !== undefined ? d.linguagem  : ''),
      d.Sensoriomotora !== undefined ? d.Sensoriomotora : (d.sensoriomotora !== undefined ? d.sensoriomotora : ''),
      d.Circunscrita   !== undefined ? d.Circunscrita   : (d.circunscrita   !== undefined ? d.circunscrita   : ''),
      d.Interpretacao  || d.interpretacao  || '',
      d.Respostas      || d.respostas      || d.answers || ''
    ];
  }

  // ── AQ-50 — v38.0 ──────────────────────────────────────────
  if (abaNome === 'AQ50') {
    var aq_total = d.total !== undefined ? d.total : '';
    var aq_zona  = aq_total !== '' ? (aq_total >= 32 ? 'Rastreio positivo' : aq_total >= 26 ? 'Zona de atenção' : 'Improvável PEA') : '';
    return [
      hoje,
      d.patientCode || d.codigo   || d.Código || '',
      d.nomeCrianca || d.NomeCrianca || d.nome || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      aq_total,
      d.social      !== undefined ? d.social      : '',
      d.atencao     !== undefined ? d.atencao     : '',
      d.rotinas     !== undefined ? d.rotinas     : '',
      d.imaginacao  !== undefined ? d.imaginacao  : '',
      aq_zona,
      d.respostas   || d.Respostas || d.answers   || ''
    ];
  }

  // ── BAS-3 — v40.0 ──────────────────────────────────────────
  if (abaNome === 'BAS3') {
    var bas3_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof bas3_resp === 'object' && bas3_resp !== null) {
      try { bas3_resp = JSON.stringify(bas3_resp); } catch(e) { bas3_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.nomeRespondente || d.nome_informante || d.NomeRespondente || d.nomeInformante || '',
      d.idade   !== undefined ? d.idade   : (d.Idade !== undefined ? d.Idade : ''),
      d.sexo    || d.Sexo  || '',
      d.ano     !== undefined ? d.ano     : (d.Ano   !== undefined ? d.Ano   : ''),
      d.grupo   || d.Grupo || '',
      d.Co !== undefined ? d.Co : '',
      d.Ac !== undefined ? d.Ac : '',
      d.Is !== undefined ? d.Is : '',
      d.At !== undefined ? d.At : '',
      d.Li !== undefined ? d.Li : '',
      d.S  !== undefined ? d.S  : '',
      d.Co_PC !== undefined ? d.Co_PC : '',
      d.Ac_PC !== undefined ? d.Ac_PC : '',
      d.Is_PC !== undefined ? d.Is_PC : '',
      d.At_PC !== undefined ? d.At_PC : '',
      d.Li_PC !== undefined ? d.Li_PC : '',
      d.S_PC  !== undefined ? d.S_PC  : '',
      bas3_resp
    ];
  }

  // ── QACSE-R — v51.0 ────────────────────────────────────────
  // Coelho & Sousa, 2020 · 32 itens · 4 escalas (AC/CR/IS/AS) · 10–16 anos.
  if (abaNome === 'QACSE_R') {
    var qacser_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof qacser_resp === 'object' && qacser_resp !== null) {
      try { qacser_resp = JSON.stringify(qacser_resp); } catch(e) { qacser_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.nomeRespondente || d.nome_informante || d.NomeRespondente || d.nomeInformante || '',
      d.idade   !== undefined ? d.idade   : (d.Idade !== undefined ? d.Idade : ''),
      d.sexo    || d.Sexo  || '',
      d.ano     !== undefined ? d.ano     : (d.Ano   !== undefined ? d.Ano   : ''),
      d.avaliador || d.Avaliador || '',
      d.AC !== undefined ? d.AC : '',
      d.CR !== undefined ? d.CR : '',
      d.IS !== undefined ? d.IS : '',
      d.AS !== undefined ? d.AS : '',
      d.AC_cat || d.ACcat || '',
      d.CR_cat || d.CRcat || '',
      d.IS_cat || d.IScat || '',
      d.AS_cat || d.AScat || '',
      qacser_resp
    ];
  }

  // ── QACSE-C — v51.0 ────────────────────────────────────────
  // Coelho & Sousa, 2016 · 40 itens · 5 escalas CASEL (ACE/RE/TP/RAC/TDR) ·
  // 10–17 anos · complementar à BAS-3.
  if (abaNome === 'QACSE_C') {
    var qacsec_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof qacsec_resp === 'object' && qacsec_resp !== null) {
      try { qacsec_resp = JSON.stringify(qacsec_resp); } catch(e) { qacsec_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.nomeRespondente || d.nome_informante || d.NomeRespondente || d.nomeInformante || '',
      d.idade   !== undefined ? d.idade   : (d.Idade !== undefined ? d.Idade : ''),
      d.sexo    || d.Sexo  || '',
      d.ano     !== undefined ? d.ano     : (d.Ano   !== undefined ? d.Ano   : ''),
      d.avaliador || d.Avaliador || '',
      d.ACE !== undefined ? d.ACE : '',
      d.RE  !== undefined ? d.RE  : '',
      d.TP  !== undefined ? d.TP  : '',
      d.RAC !== undefined ? d.RAC : '',
      d.TDR !== undefined ? d.TDR : '',
      d.ACE_cat || d.ACEcat || '',
      d.RE_cat  || d.REcat  || '',
      d.TP_cat  || d.TPcat  || '',
      d.RAC_cat || d.RACcat || '',
      d.TDR_cat || d.TDRcat || '',
      qacsec_resp
    ];
  }

  // ── PPGR-J — v41.0 ─────────────────────────────────────────
  if (abaNome === 'PPGRJ') {
    var ppgrj_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof ppgrj_resp === 'object' && ppgrj_resp !== null) {
      try { ppgrj_resp = JSON.stringify(ppgrj_resp); } catch(e) { ppgrj_resp = ''; }
    }
    var ppgrj_alertas = d.ALERTAS || d.alertas || d.Alertas || '';
    if (Array.isArray(ppgrj_alertas)) ppgrj_alertas = ppgrj_alertas.join('; ');
    else if (typeof ppgrj_alertas === 'object' && ppgrj_alertas !== null) {
      try { ppgrj_alertas = JSON.stringify(ppgrj_alertas); } catch(e) { ppgrj_alertas = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.dataNasc || d.DataNasc || d.dob || '',
      d.idade   !== undefined ? d.idade   : (d.Idade !== undefined ? d.Idade : ''),
      d.clube   || d.Clube || '',
      d.escalao || d.Escalao || d['Escalão'] || '',
      d.posicao || d['Posição'] || d.Posicao || 'Guarda-redes',
      d.nomeRespondente || d.nome_informante || d.NomeRespondente || d.nomeInformante || '',
      d.AAC  !== undefined ? d.AAC  : (d.aac !== undefined ? d.aac : ''),
      d.AAC_cls  || d.aac_cls  || '',
      d.MEF  !== undefined ? d.MEF  : (d.mef !== undefined ? d.mef : ''),
      d.MEF_cls  || d.mef_cls  || '',
      d.PFE  !== undefined ? d.PFE  : (d.pfe !== undefined ? d.pfe : ''),
      d.PFE_cls  || d.pfe_cls  || '',
      d.APP  !== undefined ? d.APP  : (d.app !== undefined ? d.app : ''),
      d.APP_cls  || d.app_cls  || '',
      d.EEIP !== undefined ? d.EEIP : (d.eeip !== undefined ? d.eeip : ''),
      d.EEIP_cls || d.eeip_cls || '',
      d.RPRM !== undefined ? d.RPRM : (d.rprm !== undefined ? d.rprm : ''),
      d.RPRM_cls || d.rprm_cls || '',
      d.TOTAL !== undefined ? d.TOTAL : (d.total !== undefined ? d.total : ''),
      d.TOTAL_cls || d.total_cls || '',
      d.NORM  !== undefined ? d.NORM  : (d.norm  !== undefined ? d.norm  : ''),
      d.DIM_PRED || d.dim_pred || d.dimPred || '',
      ppgrj_alertas,
      ppgrj_resp
    ];
  }

  // ── CCBQ — v42.0 ──────────────────────────────────────────
  if (abaNome === 'CCBQ') {
    var ccbq_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof ccbq_resp === 'object' && ccbq_resp !== null) {
      try { ccbq_resp = JSON.stringify(ccbq_resp); } catch(e) { ccbq_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.nomeRespondente || d.nome_informante || d.NomeRespondente || d.nomeInformante || '',
      d.idade    !== undefined ? d.idade    : (d.Idade !== undefined ? d.Idade : ''),
      d.sexo     || d.Sexo || '',
      d.situacao || d.Situacao || d['Situação'] || '',
      d.F1_Bruto !== undefined ? d.F1_Bruto : (d.f1_bruto !== undefined ? d.f1_bruto : ''),
      d.F1_Media !== undefined ? d.F1_Media : (d.f1_media !== undefined ? d.f1_media : ''),
      d.F1_Banda || d.f1_banda || '',
      d.F2_Bruto !== undefined ? d.F2_Bruto : (d.f2_bruto !== undefined ? d.f2_bruto : ''),
      d.F2_Media !== undefined ? d.F2_Media : (d.f2_media !== undefined ? d.f2_media : ''),
      d.F2_Banda || d.f2_banda || '',
      d.F3_Bruto !== undefined ? d.F3_Bruto : (d.f3_bruto !== undefined ? d.f3_bruto : ''),
      d.F3_Media !== undefined ? d.F3_Media : (d.f3_media !== undefined ? d.f3_media : ''),
      d.F3_Banda || d.f3_banda || '',
      d.Total_Bruto !== undefined ? d.Total_Bruto : (d.total_bruto !== undefined ? d.total_bruto : ''),
      d.Total_Media !== undefined ? d.Total_Media : (d.total_media !== undefined ? d.total_media : ''),
      d.Perfil || d.perfil || '',
      ccbq_resp
    ];
  }

  // ── KIDCOPE — Crianças (7-12) — v43.0 ──────────────────────
  if (abaNome === 'KIDCOPE_CR') {
    var kc_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof kc_resp === 'object' && kc_resp !== null) {
      try { kc_resp = JSON.stringify(kc_resp); } catch(e) { kc_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.idade    !== undefined ? d.idade    : (d.Idade !== undefined ? d.Idade : ''),
      d.nome_informante || d.nomeInformante || d.NomeInformante || d.nomeRespondente || '',
      d.versao   || d.Versao   || d['Versão'] || 'criancas',
      d.situacao || d.Situacao || d['Situação'] || '',
      d.A_pctUso !== undefined ? d.A_pctUso : '',
      d.A_pctEf  !== undefined ? d.A_pctEf  : '',
      d.A_indice !== undefined ? d.A_indice : '',
      d.A_banda  || '',
      d.E_pctUso !== undefined ? d.E_pctUso : '',
      d.E_pctEf  !== undefined ? d.E_pctEf  : '',
      d.E_indice !== undefined ? d.E_indice : '',
      d.E_banda  || '',
      d.D_pctUso !== undefined ? d.D_pctUso : '',
      d.D_pctEf  !== undefined ? d.D_pctEf  : '',
      d.D_indice !== undefined ? d.D_indice : '',
      d.D_banda  || '',
      d.perfil_chave || d.Perfil_Chave || '',
      d.perfil_nome  || d.Perfil_Nome  || '',
      kc_resp
    ];
  }

  // ── KIDCOPE — Adolescentes (13-18) — v43.0 ─────────────────
  if (abaNome === 'KIDCOPE_AD') {
    var kc2_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof kc2_resp === 'object' && kc2_resp !== null) {
      try { kc2_resp = JSON.stringify(kc2_resp); } catch(e) { kc2_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.idade    !== undefined ? d.idade    : (d.Idade !== undefined ? d.Idade : ''),
      d.nome_informante || d.nomeInformante || d.NomeInformante || d.nomeRespondente || '',
      d.versao   || d.Versao   || d['Versão'] || 'adolescentes',
      d.situacao || d.Situacao || d['Situação'] || '',
      d.A_pctUso !== undefined ? d.A_pctUso : '',
      d.A_pctEf  !== undefined ? d.A_pctEf  : '',
      d.A_indice !== undefined ? d.A_indice : '',
      d.A_banda  || '',
      d.E_pctUso !== undefined ? d.E_pctUso : '',
      d.E_pctEf  !== undefined ? d.E_pctEf  : '',
      d.E_indice !== undefined ? d.E_indice : '',
      d.E_banda  || '',
      d.D_pctUso !== undefined ? d.D_pctUso : '',
      d.D_pctEf  !== undefined ? d.D_pctEf  : '',
      d.D_indice !== undefined ? d.D_indice : '',
      d.D_banda  || '',
      d.A_discrep !== undefined ? d.A_discrep : '',
      d.A_flag    || '—',
      d.E_discrep !== undefined ? d.E_discrep : '',
      d.E_flag    || '—',
      d.D_discrep !== undefined ? d.D_discrep : '',
      d.D_flag    || '—',
      d.perfil_chave || d.Perfil_Chave || '',
      d.perfil_nome  || d.Perfil_Nome  || '',
      kc2_resp
    ];
  }

  // ── ANAMNESE — História Prévia — v44.0 ─────────────────────
  if (abaNome === 'ANAMNESE_HP') {
    var anamHP_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof anamHP_resp === 'object' && anamHP_resp !== null) {
      try { anamHP_resp = JSON.stringify(anamHP_resp); } catch(e) { anamHP_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || d.nomeRespondente || '',
      d.relacao || d['Relação'] || d.Relacao || '',
      anamHP_resp
    ];
  }

  // ── ISC-24 — Inventário de Somatização para Crianças — v45.0 ───────────
  if (abaNome === 'ISC24') {
    var isc_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof isc_resp === 'object' && isc_resp !== null) {
      try { isc_resp = JSON.stringify(isc_resp); } catch(e) { isc_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d.childName || d.nome || '',
      d.nomeRespondente || d.nome_informante || d.NomeRespondente || d.nomeInformante || '',
      d.relacao || d['Relação'] || d.Relacao || '',
      d.idade !== undefined ? d.idade : (d.Idade !== undefined ? d.Idade : ''),
      d.genero || d.Genero || d['Género'] || d.sexo || '',
      d.anoEscolar !== undefined ? d.anoEscolar : (d.Ano !== undefined ? d.Ano : ''),
      d.PT !== undefined ? d.PT : (d.pt !== undefined ? d.pt : (d.total !== undefined ? d.total : '')),
      d.media_item !== undefined ? d.media_item : (d.Media_Item !== undefined ? d.Media_Item : ''),
      d.n_sintomas !== undefined ? d.n_sintomas : (d.N_Sintomas !== undefined ? d.N_Sintomas : ''),
      d.n_intensos !== undefined ? d.n_intensos : (d.N_Intensos !== undefined ? d.N_Intensos : ''),
      d.z_score !== undefined ? d.z_score : (d.Z_Score !== undefined ? d.Z_Score : ''),
      d.percentil !== undefined ? d.percentil : (d.Percentil !== undefined ? d.Percentil : ''),
      d.classificacao || d.Classificacao || d['Classificação'] || '',
      d.grupo_norma || d.Grupo_Norma || '',
      d.C1_soma !== undefined ? d.C1_soma : (d.C1_Soma !== undefined ? d.C1_Soma : ''),
      d.C1_media !== undefined ? d.C1_media : (d.C1_Media !== undefined ? d.C1_Media : ''),
      d.C2_soma !== undefined ? d.C2_soma : (d.C2_Soma !== undefined ? d.C2_Soma : ''),
      d.C2_media !== undefined ? d.C2_media : (d.C2_Media !== undefined ? d.C2_Media : ''),
      d.C3_soma !== undefined ? d.C3_soma : (d.C3_Soma !== undefined ? d.C3_Soma : ''),
      d.C3_media !== undefined ? d.C3_media : (d.C3_Media !== undefined ? d.C3_Media : ''),
      d.C4_soma !== undefined ? d.C4_soma : (d.C4_Soma !== undefined ? d.C4_Soma : ''),
      d.C4_media !== undefined ? d.C4_media : (d.C4_Media !== undefined ? d.C4_Media : ''),
      d.C5_soma !== undefined ? d.C5_soma : (d.C5_Soma !== undefined ? d.C5_Soma : ''),
      d.C5_media !== undefined ? d.C5_media : (d.C5_Media !== undefined ? d.C5_Media : ''),
      d.C6_soma !== undefined ? d.C6_soma : (d.C6_Soma !== undefined ? d.C6_Soma : ''),
      d.C6_media !== undefined ? d.C6_media : (d.C6_Media !== undefined ? d.C6_Media : ''),
      d.C7_soma !== undefined ? d.C7_soma : (d.C7_Soma !== undefined ? d.C7_Soma : ''),
      d.C7_media !== undefined ? d.C7_media : (d.C7_Media !== undefined ? d.C7_Media : ''),
      isc_resp
    ];
  }

  // ── QEA — Questionário de Esquemas para Adolescentes — v46.0 ───────────
  if (abaNome === 'QEA') {
    var qea_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof qea_resp === 'object' && qea_resp !== null) {
      try { qea_resp = JSON.stringify(qea_resp); } catch(e) { qea_resp = ''; }
    }
    var qea_codes = ['IS','EMA','PER','PE','AB','AP','AS','VUL','DA','IEMOC',
                     'SUB','GR','FR','DEP','DF','REC','AI','PESS'];
    var qea_row = [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.NomeCrianca || d.nomeCrianca || d.nome_crianca || d.childName || d.nome || '',
      d.NomeInformante || d.nome_informante || d.nomeInformante || d.nomeRespondente || '',
      d.Idade !== undefined ? d.Idade : (d.idade !== undefined ? d.idade : ''),
      d.Sexo || d.sexo || d['Género'] || d.genero || '',
      d.AnoEscolaridade !== undefined ? d.AnoEscolaridade : (d.anoEscolar !== undefined ? d.anoEscolar : (d.ano !== undefined ? d.ano : '')),
      d.TotalQEA !== undefined ? d.TotalQEA : (d.totalQEA !== undefined ? d.totalQEA : ''),
      d.MediaGlobal !== undefined ? d.MediaGlobal : (d.mediaGlobal !== undefined ? d.mediaGlobal : ''),
      d.NPrevalentes !== undefined ? d.NPrevalentes : (d.nPrevalentes !== undefined ? d.nPrevalentes : ''),
      d.EsquemaDominante || d.esquemaDominante || d.esqDominante || ''
    ];
    qea_codes.forEach(function(c) {
      qea_row.push(d[c + '_Total'] !== undefined ? d[c + '_Total'] : '');
      qea_row.push(d[c + '_Media'] !== undefined ? d[c + '_Media'] : '');
    });
    qea_row.push(d.MVD_Media !== undefined ? d.MVD_Media : '');
    qea_row.push(d.LEV_Media !== undefined ? d.LEV_Media : '');
    qea_row.push(d.AE_Media  !== undefined ? d.AE_Media  : '');
    qea_row.push(qea_resp);
    return qea_row;
  }

  // ── EMP-H&F — Escala Multidimensional de Perfeccionismo (Hewitt & Flett, 1991) — v47.0 ──
  if (abaNome === 'EMP_HF') {
    var emphf_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof emphf_resp === 'object' && emphf_resp !== null) {
      try { emphf_resp = JSON.stringify(emphf_resp); } catch(e) { emphf_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.NomeCrianca || d.nome_crianca || d.childName || d.nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || d.nomeRespondente || d.NomeRespondente || '',
      d.idade !== undefined ? d.idade : (d.Idade !== undefined ? d.Idade : ''),
      d.sexo || d.Sexo || d['Género'] || '',
      d.PAO_raw !== undefined ? d.PAO_raw : '',
      d.PSP_raw !== undefined ? d.PSP_raw : '',
      d.POO_raw !== undefined ? d.POO_raw : '',
      d.TOTAL_raw !== undefined ? d.TOTAL_raw : '',
      d.PAO_media !== undefined ? d.PAO_media : '',
      d.PSP_media !== undefined ? d.PSP_media : '',
      d.POO_media !== undefined ? d.POO_media : '',
      d.TOTAL_media !== undefined ? d.TOTAL_media : '',
      emphf_resp
    ];
  }

  // ── EMP-F — Escala Multidimensional de Perfeccionismo (Frost et al., 1990) — v47.0 ──
  if (abaNome === 'EMP_F') {
    var empf_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof empf_resp === 'object' && empf_resp !== null) {
      try { empf_resp = JSON.stringify(empf_resp); } catch(e) { empf_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.nomeCrianca || d.NomeCrianca || d.nome_crianca || d.childName || d.nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || d.nomeRespondente || d.NomeRespondente || '',
      d.idade !== undefined ? d.idade : (d.Idade !== undefined ? d.Idade : ''),
      d.sexo || d.Sexo || d['Género'] || '',
      d.CM_raw !== undefined ? d.CM_raw : '',
      d.DA_raw !== undefined ? d.DA_raw : '',
      d.PE_raw !== undefined ? d.PE_raw : '',
      d.PC_raw !== undefined ? d.PC_raw : '',
      d.PS_raw !== undefined ? d.PS_raw : '',
      d.O_raw  !== undefined ? d.O_raw  : '',
      d.CM_media !== undefined ? d.CM_media : '',
      d.DA_media !== undefined ? d.DA_media : '',
      d.PE_media !== undefined ? d.PE_media : '',
      d.PC_media !== undefined ? d.PC_media : '',
      d.PS_media !== undefined ? d.PS_media : '',
      d.O_media  !== undefined ? d.O_media  : '',
      empf_resp
    ];
  }

  // ── OCI-CV-R — Inventário Obsessivo-Compulsivo Revisto para Crianças (Abramovitch et al., 2022) — v48.0 ──
  // Payload enviado pelo OCI_CV_R_v1.html:
  //   instrumento:'OCI_CV_R', patientCode, NomeCrianca, NomeInformante,
  //   Idade, Sexo, GrupoIdade ('<12' | '>=12'), DataAplicacao,
  //   Total (0-36), VD_Raw (0-10), OBS_Raw (0-8), LAV_Raw (0-6),
  //   ORD_Raw (0-6), NEUTR_Raw (0-6),
  //   Categoria (Ausência/Normal | Limiar | Provável POC | OC marcada | OC severa),
  //   Respostas (JSON.stringify dos 18 itens q1..q18)
  if (abaNome === 'OCI_CV_R') {
    var ocicvr_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof ocicvr_resp === 'object' && ocicvr_resp !== null) {
      try { ocicvr_resp = JSON.stringify(ocicvr_resp); } catch(e) { ocicvr_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.NomeCrianca || d.nomeCrianca || d.nome_crianca || d.childName || d.nome || '',
      d.NomeInformante || d.nome_informante || d.nomeInformante || d.nomeRespondente || d.NomeRespondente || '',
      d.Idade !== undefined ? d.Idade : (d.idade !== undefined ? d.idade : ''),
      d.Sexo || d.sexo || d['Género'] || d.genero || '',
      d.GrupoIdade || d.grupoIdade || d.grupo_idade || '',
      d.Total !== undefined ? d.Total : (d.total !== undefined ? d.total : ''),
      d.VD_Raw    !== undefined ? d.VD_Raw    : (d.vd_raw    !== undefined ? d.vd_raw    : (d.VD    !== undefined ? d.VD    : (d.vd    !== undefined ? d.vd    : ''))),
      d.OBS_Raw   !== undefined ? d.OBS_Raw   : (d.obs_raw   !== undefined ? d.obs_raw   : (d.OBS   !== undefined ? d.OBS   : (d.obs   !== undefined ? d.obs   : ''))),
      d.LAV_Raw   !== undefined ? d.LAV_Raw   : (d.lav_raw   !== undefined ? d.lav_raw   : (d.LAV   !== undefined ? d.LAV   : (d.lav   !== undefined ? d.lav   : ''))),
      d.ORD_Raw   !== undefined ? d.ORD_Raw   : (d.ord_raw   !== undefined ? d.ord_raw   : (d.ORD   !== undefined ? d.ORD   : (d.ord   !== undefined ? d.ord   : ''))),
      d.NEUTR_Raw !== undefined ? d.NEUTR_Raw : (d.neutr_raw !== undefined ? d.neutr_raw : (d.NEUTR !== undefined ? d.NEUTR : (d.neutr !== undefined ? d.neutr : ''))),
      d.Categoria || d.categoria || d.classificacao || d['Classificação'] || '',
      ocicvr_resp
    ];
  }

  // ── OCI-R — Inventário Obsessivo-Compulsivo Revisto (Foa et al., 2002 · versão PT Cardoso, 2015) — v49.0 ──
  // Payload enviado pelo OCI_R_v1.html:
  //   instrumento:'OCI_R', patientCode, NomePaciente,
  //   Idade, Sexo, DataAplicacao,
  //   Total (0-72),
  //   Lavagem_Raw (0-12), Verificacao_Raw (0-12), Ordem_Raw (0-12),
  //   Acumulacao_Raw (0-12), Obsessoes_Raw (0-12), Neutralizacao_Raw (0-12),
  //   Categoria (Ausência/Baixa | Ligeira (subclínica) | Moderada (provável POC) | Marcada | Severa),
  //   Respostas (JSON.stringify dos 18 itens q1..q18)
  if (abaNome === 'OCI_R') {
    var ocir_resp = d.Respostas || d.respostas || d.answers || '';
    if (typeof ocir_resp === 'object' && ocir_resp !== null) {
      try { ocir_resp = JSON.stringify(ocir_resp); } catch(e) { ocir_resp = ''; }
    }
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || '',
      d.NomePaciente || d.nomePaciente || d.nome_paciente || d.NomeRespondente || d.nomeRespondente || d.nome || '',
      d.Idade !== undefined ? d.Idade : (d.idade !== undefined ? d.idade : ''),
      d.Sexo || d.sexo || d['Género'] || d.genero || '',
      d.DataAplicacao || d.dataAplicacao || d.data_aplicacao || d.dataAvaliacao || hoje,
      d.Total !== undefined ? d.Total : (d.total !== undefined ? d.total : ''),
      d.Lavagem_Raw       !== undefined ? d.Lavagem_Raw       : (d.lavagem_raw       !== undefined ? d.lavagem_raw       : (d.Lavagem       !== undefined ? d.Lavagem       : (d.lavagem       !== undefined ? d.lavagem       : ''))),
      d.Verificacao_Raw   !== undefined ? d.Verificacao_Raw   : (d.verificacao_raw   !== undefined ? d.verificacao_raw   : (d.Verificacao   !== undefined ? d.Verificacao   : (d.verificacao   !== undefined ? d.verificacao   : ''))),
      d.Ordem_Raw         !== undefined ? d.Ordem_Raw         : (d.ordem_raw         !== undefined ? d.ordem_raw         : (d.Ordem         !== undefined ? d.Ordem         : (d.ordem         !== undefined ? d.ordem         : ''))),
      d.Acumulacao_Raw    !== undefined ? d.Acumulacao_Raw    : (d.acumulacao_raw    !== undefined ? d.acumulacao_raw    : (d.Acumulacao    !== undefined ? d.Acumulacao    : (d.acumulacao    !== undefined ? d.acumulacao    : ''))),
      d.Obsessoes_Raw     !== undefined ? d.Obsessoes_Raw     : (d.obsessoes_raw     !== undefined ? d.obsessoes_raw     : (d.Obsessoes     !== undefined ? d.Obsessoes     : (d.obsessoes     !== undefined ? d.obsessoes     : ''))),
      d.Neutralizacao_Raw !== undefined ? d.Neutralizacao_Raw : (d.neutralizacao_raw !== undefined ? d.neutralizacao_raw : (d.Neutralizacao !== undefined ? d.Neutralizacao : (d.neutralizacao !== undefined ? d.neutralizacao : ''))),
      d.Categoria || d.categoria || d.classificacao || d['Classificação'] || '',
      ocir_resp
    ];
  }

  if (abaNome === 'ABAS3_05' || abaNome === 'ABAS3_05P') {
    return [ hoje, d.patientCode||'', d.nome||d.nomeCrianca||'',
             d.sexo||'', d.idade||'', d.informante||'',
             d.cag||'', d.cc||'', d.sc||'', d.pc||'',
             d.COM_SB||'', d.COM_SS||'', d.CU_SB||'',  d.CU_SS||'',
             d.HL_SB||'',  d.HL_SS||'',  d.HS_SB||'',  d.HS_SS||'',
             d.LE_SB||'',  d.LE_SS||'',  d.SD_SB||'',  d.SD_SS||'',
             d.SO_SB||'',  d.SO_SS||'',  d.answers||'' ];
  }

  if (abaNome === 'ABAS3_PAIS') {
    return [ hoje, d.patientCode||'', d.nomeCrianca||'', d.nomeInformante||'',
             d.parentesco||'', d.idade||'',
             d.CAG||d.cag||'', d.CC||d.cc||'', d.SC||d.sc||'', d.PC||d.pc||'',
             d.COM_SB||'', d.COM_SS||'', d.CU_SB||'', d.CU_SS||'',
             d.FA_SB||'',  d.FA_SS||'',  d.HL_SB||'', d.HL_SS||'',
             d.HS_SB||'',  d.HS_SS||'',  d.LE_SB||'', d.LE_SS||'',
             d.SD_SB||'',  d.SD_SS||'',  d.SO_SB||'', d.SO_SS||'',
             d.WK_SB||'',  d.WK_SS||'',  d.answers||'' ];
  }

  if (abaNome === 'ABAS3_PROF') {
    return [ hoje, d.patientCode||'', d.nomeCrianca||'', d.nomeInformante||'',
             d.nivel_escolar||'', d.tempo_conhece||'',
             d.CAG||d.cag||'', d.CC||d.cc||'', d.SC||d.sc||'', d.PC||d.pc||'',
             d.COM_SB||'', d.COM_SS||'', d.CU_SB||'', d.CU_SS||'',
             d.FA_SB||'',  d.FA_SS||'',  d.HL_SB||'', d.HL_SS||'',
             d.HS_SB||'',  d.HS_SS||'',  d.LE_SB||'', d.LE_SS||'',
             d.SD_SB||'',  d.SD_SS||'',  d.SO_SB||'', d.SO_SS||'',
             d.WK_SB||'',  d.WK_SS||'',  d.answers||'' ];
  }

  if (abaNome === 'ABAS3_ADULT') {
    return [ hoje, d.patientCode||'', d.nomeCrianca||'', d.nomeInformante||'',
             d.idade||'', d.situacao||'',
             d.GAC||d.gac||d.CAG||d.cag||'',
             d.CC||d.cc||'', d.SC||d.sc||'', d.PC||d.pc||'',
             d.COM_SB||'', d.COM_SS||'', d.FA_SB||'',  d.FA_SS||'',
             d.SD_SB||'',  d.SD_SS||'',  d.LE_SB||'',  d.LE_SS||'',
             d.SO_SB||'',  d.SO_SS||'',  d.CU_SB||'',  d.CU_SS||'',
             d.HL_SB||'',  d.HL_SS||'',  d.HS_SB||'',  d.HS_SS||'',
             d.SC_SB||'',  d.SC_SS||'',  d.WK_SB||'',  d.WK_SS||'',
             d.answers||'' ];
  }

  if (abaNome === 'BRIEF_Professores') {
    return [ hoje, d.patientCode||d.codigo||'', d.childName||d.nomeCrianca||d.nome||'',
             d.dob||'', d.gender||d.sexo||'', d.grade||'',
             d.teacherName||d.nomeInquirido||d.preenchidoPor||'', d.subject||'',
             d.INI||'', d.MUD||'', d.CE||'', d.INC||'', d.MT||'',
             d.PO||'',  d.OM||'',  d.MON||'',
             d.IRC||'', d.IM||'',  d.GEF||'', d.Respostas||d.answers||'' ];
  }

  if (abaNome === 'BRIEF_Pais') {
    return [ hoje, d.patientCode||d.codigo||'', d.childName||d.nomeCrianca||d.nome_crianca||d.nome||'',
             d.dob||'', d.gender||d.genero||d.sexo||'', d.grade||d.ano_escolar||'',
             d.nome_preenche||d.nomeRespondente||d.nomeInquirido||'', d.relacao||'',
             d.INI||'', d.MUD||'', d.CE||'', d.INC||'', d.MT||'',
             d.PO||'',  d.OM||'',  d.MON||'',
             d.IRC||'', d.IM||'',  d.GEF||'',
             d.Respostas||d.answers||'' ];
  }

  if (abaNome === 'BRIEF_PreEscolar_Pais') {
    return [
      hoje,
      d.CodigoPaciente||d.patientCode||d.codigo||'',
      d.NomeCrianca||d.nomeCrianca||d.nome||'',
      d.DataNascimento||d.dob||'',
      d.Genero||d.genero||d.gender||'',
      d.Escola||d.escola||'',
      d.NomeInformante||d.nomeInformante||'',
      d.Relacao||d.relacao||'',
      d.INHIB_raw||'', d.SHIFT_raw||'', d.ECON_raw||'',
      d.WM_raw||'',    d.PO_raw||'',
      d.ISCI_raw||'',  d.FI_raw||'',   d.EMI_raw||'',  d.GEC_raw||'',
      d.INHIB_T||'',   d.SHIFT_T||'',  d.ECON_T||'',
      d.WM_T||'',      d.PO_T||'',
      d.ISCI_T||'',    d.FI_T||'',     d.EMI_T||'',    d.GEC_T||'',
      d.Inconsistencia||d.inconsistencia||'',
      d.Negatividade||d.negatividade||'',
      d.Respostas||d.answers||''
    ];
  }

  if (abaNome === 'BRIEF_PreEscolar_Professores') {
    return [
      hoje,
      d.CodigoPaciente||d.patientCode||d.codigo||'',
      d.NomeCrianca||d.nomeCrianca||d.nome||'',
      d.NomeInformante||d.nomeInformante||d.Professor||'',
      d.DataNascimento||d.dob||'',
      d.Genero||d.genero||d.gender||'',
      d.Escola||d.escola||'',
      d.INHIB_raw||'', d.SHIFT_raw||'', d.ECON_raw||'',
      d.WM_raw||'',    d.PO_raw||'',
      d.ISCI_raw||'',  d.FI_raw||'',   d.EMI_raw||'',  d.GEC_raw||'',
      d.INHIB_T||'',   d.SHIFT_T||'',  d.ECON_T||'',
      d.WM_T||'',      d.PO_T||'',
      d.ISCI_T||'',    d.FI_T||'',     d.EMI_T||'',    d.GEC_T||'',
      d.Inconsistencia||d.inconsistencia||'',
      d.Negatividade||d.negatividade||'',
      d.Respostas||d.answers||''
    ];
  }

  if (abaNome === 'BRIEF_Autoavaliacao') {
    return [
      hoje,
      d.patientCode||d.codigo||'',
      d.patientName||d.nome||'',
      d.dob||'', d.age||'', d.ageGroup||'', d.genero||d.gender||'', d.anoEscolar||'',
      d.rawInib||'', d.rawShift||'', d.rawEC||'', d.rawMon||'',
      d.rawWM||'',   d.rawPO||'',   d.rawOM||'', d.rawTC||'',
      d.rawIRC||'',  d.rawIM||'',   d.rawGEF||'',
      d.tInib||'',   d.tShift||'',  d.tEC||'',   d.tMon||'',
      d.tWM||'',     d.tPO||'',     d.tOM||'',   d.tTC||'',
      d.tIRC||'',    d.tIM||'',     d.tGEF||'',
      d.inconsistencia||'', d.negatividade||'', d.answers||''
    ];
  }

  if (abaNome === 'SCARED_R_CRIANCA') {
    return [
      hoje, d.patientCode||d.codigo||'', d.childName||d.nomeCrianca||'',
      d.dob||'', d.genero||d.gender||'', d.ano_escolar||d.grade||'',
      d.nome_informante||'', d.totalScore||'', d.classificacao||'',
      d['sub_Perturbação de Pânico']||d.sub_Perturbac_o_de_P_nico||'',
      d['sub_Ansiedade Generalizada']||d.sub_Ansiedade_Generalizada||'',
      d['sub_Ansiedade de Separação']||d.sub_Ansiedade_de_Separac_o||'',
      d['sub_Fobia Social']||d.sub_Fobia_Social||'',
      d['sub_Fobia Específica (total)']||d.sub_Fobia_Espec_fica__total_||'',
      d['sub_Pert. Obsessivo-Compulsiva']||d.sub_Pert__Obsessivo_Compulsiva||'',
      d['sub_Pert. de Stress Pós-Traumático']||d.sub_Pert__de_Stress_P_s_Traum_tico||'',
      d['fe_Fobia à Escola']||d.fe_Fobia___Escola||'',
      d['fe_Fobia Específica — Situacional']||d.fe_Fobia_Espec_fica___Situacional||'',
      d['fe_Fobia Específica — Sangue']||d.fe_Fobia_Espec_fica___Sangue||'',
      d['fe_Fobia Específica — Animais']||d.fe_Fobia_Espec_fica___Animais||'',
      d.answers||'' ];
  }

  if (abaNome === 'SCARED_R_PAIS') {
    return [
      hoje, d.patientCode||d.codigo||'', d.childName||d.nomeCrianca||'',
      d.dob||'', d.genero||d.gender||'', d.ano_escolar||d.grade||'',
      d.nome_informante||d.respondentName||'', d.relacao||d.respondentRelation||'',
      (d.totalScore != null ? d.totalScore : ''), d.classificacao||'',
      (d['sub_Perturbação de Pânico'] != null ? d['sub_Perturbação de Pânico'] : (d.sub_Perturbac_o_de_P_nico != null ? d.sub_Perturbac_o_de_P_nico : '')),
      (d['sub_Ansiedade Generalizada'] != null ? d['sub_Ansiedade Generalizada'] : (d.sub_Ansiedade_Generalizada != null ? d.sub_Ansiedade_Generalizada : '')),
      (d['sub_Ansiedade de Separação'] != null ? d['sub_Ansiedade de Separação'] : (d.sub_Ansiedade_de_Separac_o != null ? d.sub_Ansiedade_de_Separac_o : '')),
      (d['sub_Fobia Social'] != null ? d['sub_Fobia Social'] : (d.sub_Fobia_Social != null ? d.sub_Fobia_Social : '')),
      (d['sub_Fobia Específica (total)'] != null ? d['sub_Fobia Específica (total)'] : (d.sub_Fobia_Espec_fica__total_ != null ? d.sub_Fobia_Espec_fica__total_ : '')),
      (d['sub_Pert. Obsessivo-Compulsiva'] != null ? d['sub_Pert. Obsessivo-Compulsiva'] : (d.sub_Pert__Obsessivo_Compulsiva != null ? d.sub_Pert__Obsessivo_Compulsiva : '')),
      (d['sub_Pert. de Stress Pós-Traumático'] != null ? d['sub_Pert. de Stress Pós-Traumático'] : (d.sub_Pert__de_Stress_P_s_Traum_tico != null ? d.sub_Pert__de_Stress_P_s_Traum_tico : '')),
      (d['fe_Fobia à Escola'] != null ? d['fe_Fobia à Escola'] : (d.fe_Fobia___Escola != null ? d.fe_Fobia___Escola : '')),
      (d['fe_Fobia Específica — Situacional'] != null ? d['fe_Fobia Específica — Situacional'] : (d.fe_Fobia_Espec_fica___Situacional != null ? d.fe_Fobia_Espec_fica___Situacional : '')),
      (d['fe_Fobia Específica — Sangue'] != null ? d['fe_Fobia Específica — Sangue'] : (d.fe_Fobia_Espec_fica___Sangue != null ? d.fe_Fobia_Espec_fica___Sangue : '')),
      (d['fe_Fobia Específica — Animais'] != null ? d['fe_Fobia Específica — Animais'] : (d.fe_Fobia_Espec_fica___Animais != null ? d.fe_Fobia_Espec_fica___Animais : '')),
      d.answers||'' ];
  }

  if (abaNome === 'SPAS_Pais') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.dataNasc||d.dob||'', d.idade||'', d.genero||d.gender||'',
      d.nome_informante||d.respondente||'', d.relacao||d.respondente||'',
      (d.AG != null ? d.AG : ''), (d.AS != null ? d.AS : ''),
      (d.SEP != null ? d.SEP : ''), (d.MDF != null ? d.MDF : ''),
      (d.POC != null ? d.POC : ''),
      (d.Total != null ? d.Total : (d.totalScore != null ? d.totalScore : '')),
      d.answers||'' ];
  }

  if (abaNome === 'SPAS_Prof') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.dataNasc||d.dob||'', d.idade||'', d.genero||d.gender||'',
      d.nome_informante||d.respondente||'', d.relacao||d.respondente||'', d.instituicao||'',
      (d.AG != null ? d.AG : ''), (d.AS != null ? d.AS : ''),
      (d.SEP != null ? d.SEP : ''), (d.MDF != null ? d.MDF : ''),
      (d.POC != null ? d.POC : ''),
      (d.Total != null ? d.Total : (d.totalScore != null ? d.totalScore : '')),
      d.answers||'' ];
  }

  if (abaNome === 'QEDP') {
    return [
      hoje, d.codigo||d.patientCode||'', d.nome_crianca||d.nomeCrianca||d.childName||'',
      d.informante||'', d.nome_informante||'',
      d.dem_media||'', d.dem_t||'', d.dem_cls||'',
      d.aut_media||'', d.aut_t||'', d.aut_cls||'',
      d.per_media||'', d.per_t||'', d.per_cls||'',
      d.respostas||d.answers||'' ];
  }

  if (abaNome === 'QC_Coparentalidade') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.nome_informante||d.Respondente||'', d.versao||d.Versao||'',
      d.Cooperacao_Raw||'',   String(d.Cooperacao_Media||''),
      d.Triangulacao_Raw||'', String(d.Triangulacao_Media||''),
      d.Conflito_Raw||'',     String(d.Conflito_Media||''),
      d.Respostas||d.respostas||d.answers||'' ];
  }

  if (abaNome === 'DIVA5') {
    var respostasStr = d.answers;
    if (Array.isArray(respostasStr)) respostasStr = JSON.stringify(respostasStr);
    // ⚠ 'Respostas' = 18 segmentos "Adultez|Infância" separados por ';'. É a
    // matéria-prima da grelha de convergência entre os três informadores:
    // se chegar truncada ou coagida, a vista composta fica inutilizável.
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.nome_informante||d.respondente||'', d.relacao||'', d.versao||'',
      d.nivelDI||'', d.faixa||'',
      d.desatAdult!==undefined?d.desatAdult:'', d.desatInf!==undefined?d.desatInf:'',
      d.hiAdult!==undefined?d.hiAdult:'', d.hiInf!==undefined?d.hiInf:'',
      d.diagnostico||(d.scores&&d.scores.diag)||'', respostasStr||'',
      // ── v112.0 · 4 campos NOVOS, acrescentados no fim ───────────────────
      // ⚠ Guarda != null obrigatória em RespAdultez/RespInfancia: 0 significa
      // «coluna não respondida» e é precisamente o valor que faz o painel
      // devolver INDETERMINADO. Com  ||''  o zero desaparecia e o parceiro
      // (só Adultez) passaria a ser lido como infância avaliada e negativa.
      d.critA!=null ? d.critA : '',
      d.critB!=null ? d.critB : '',
      d.respAdu!=null ? d.respAdu : '',
      d.respInf!=null ? d.respInf : '' ];
  }

  if (abaNome === 'ERC_Professores' || abaNome === 'ERC_Pais') {
    // Helper: devolve valor se for número/string não-vazia, senão ''. Não colapsa 0.
    function v(x, alt) {
      if (x !== undefined && x !== null && x !== '') return x;
      if (alt !== undefined && alt !== null && alt !== '') return alt;
      return '';
    }
    return [
      hoje,
      v(d.patientCode, d.codigo),
      v(d.nomeCrianca, d.childName !== undefined ? d.childName : d.nome_crianca),
      v(d.nomeInformante, d.nome_preenche !== undefined ? d.nome_preenche : d.nomeRespondente),
      v(d.relacao),
      // Sexo: payload pode usar 'sexo' ou 'sexo_crianca' — aceitar ambos
      v(d.sexo, d.sexo_crianca),
      v(d.ln_score, d['L/N']),
      v(d.re_score, d.RE),
      v(d.total_score, d.total),
      v(d.answers, d.respostas)
    ];
  }

  if (abaNome === 'EAFE') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.nome||d.nomeCrianca||'',
      d.nome_informante||d.nomeInformante||'',
      d.nascimento||d.dataNasc||d.dob||'',
      d.anoEscolaridade||d.anoEscolar||'', d.escola||'', d.modo||'',
      d.DE!==undefined?d.DE:'', d.DR!==undefined?d.DR:'',
      d.EE!==undefined?d.EE:'', d.DRE!==undefined?d.DRE:'',
      d.perfil||'',
      d.emocao14!==undefined?d.emocao14:'',
      d.intensidade14!==undefined?d.intensidade14:'',
      d.obsJovem||'', d.obsAvaliador||'', d.answers||'',
      d.ALP!==undefined?d.ALP:'',
      d.versao||'1.0'
    ];
  }

  if (abaNome === 'ECE_FEA') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.nomeCrianca||d.NomeCrianca||'',
      d.nome_informante||d.nomeInformante||'',
      d.scoreA!==undefined?d.scoreA:'', d.scoreB!==undefined?d.scoreB:'',
      d.scoreC!==undefined?d.scoreC:'', d.scoreD!==undefined?d.scoreD:'',
      d.scoreE!==undefined?d.scoreE:'', d.igae!==undefined?d.igae:'',
      d.answers||''
    ];
  }

  if (abaNome === 'RCADS_25CG' || abaNome === 'RCADS_25Y') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||d.nomeJovem||'',
      d.nomeInformante||d.nome_informante||d.nomeEE||'',
      d.age||d.idade||'', d.gender||d.sexo||'',
      d.relation||d.relacao||d.anoEscolar||'',
      d.mdd!==undefined?d.mdd:'', d.mddT!==undefined?d.mddT:'',
      d.anx!==undefined?d.anx:'', d.anxT!==undefined?d.anxT:'',
      d.total!==undefined?d.total:'', d.totalT!==undefined?d.totalT:'',
      d.sp!==undefined?d.sp:'', d.sad!==undefined?d.sad:'',
      d.gad!==undefined?d.gad:'', d.pd!==undefined?d.pd:'',
      d.ocd!==undefined?d.ocd:'', d.answers||''
    ];
  }

  if (abaNome === 'RCADS_47CG' || abaNome === 'RCADS_47Y') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||d.nomeJovem||'',
      d.nomeInformante||d.nome_informante||d.nomeEE||'',
      d.age||d.idade||'', d.gender||d.sexo||'',
      d.relation||d.relacao||d.anoEscolar||'',
      d.mdd!==undefined?d.mdd:'', d.mddT!==undefined?d.mddT:'',
      d.anx!==undefined?d.anx:'', d.anxT!==undefined?d.anxT:'',
      d.total!==undefined?d.total:'', d.totalT!==undefined?d.totalT:'',
      d.sp!==undefined?d.sp:'',   d.spT!==undefined?d.spT:'',
      d.sad!==undefined?d.sad:'', d.sadT!==undefined?d.sadT:'',
      d.gad!==undefined?d.gad:'', d.gadT!==undefined?d.gadT:'',
      d.pd!==undefined?d.pd:'',   d.pdT!==undefined?d.pdT:'',
      d.ocd!==undefined?d.ocd:'', d.ocdT!==undefined?d.ocdT:'',
      d.answers||''
    ];
  }

  if (abaNome === 'EAT26') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.patientName||d.nome||'',
      d.dob||'', d.sex||d.sexo||'',
      d.scoreD!==undefined?d.scoreD:(d.D||''),
      d.scoreB!==undefined?d.scoreB:(d.B||''),
      d.scoreOC!==undefined?d.scoreOC:(d.OC||''),
      d.total!==undefined?d.total:'', d.rastreio||'',
      d.riscoB1||'', d.riscoB2||'', d.riscoB3||'',
      d.riscoB4||'', d.riscoB5||'', d.answers||''
    ];
  }

  if (abaNome === 'CONNERS3P_FULL') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.NomeCrianca||'',
      d.nomeInformante||d.NomeInformante||'', d.relacao||'Pais', d.idade||'',
      d.score_IN!==undefined?d.score_IN:'', d.score_HI!==undefined?d.score_HI:'',
      d.score_LP!==undefined?d.score_LP:'', d.score_EF!==undefined?d.score_EF:'',
      d.score_AG!==undefined?d.score_AG:'', d.score_PR!==undefined?d.score_PR:'',
      d.score_DSMI!==undefined?d.score_DSMI:'', d.score_DSMH!==undefined?d.score_DSMH:'',
      d.score_CD!==undefined?d.score_CD:'', d.score_ODD!==undefined?d.score_ODD:'',
      d.t_IN!==undefined?d.t_IN:'', d.t_HI!==undefined?d.t_HI:'',
      d.t_LP!==undefined?d.t_LP:'', d.t_EF!==undefined?d.t_EF:'',
      d.t_AG!==undefined?d.t_AG:'', d.t_PR!==undefined?d.t_PR:'',
      d.t_DSMI!==undefined?d.t_DSMI:'', d.t_DSMH!==undefined?d.t_DSMH:'',
      d.t_CD!==undefined?d.t_CD:'', d.t_ODD!==undefined?d.t_ODD:'',
      d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'CONNERS3T_FULL') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.NomeCrianca||'',
      d.nomeInformante||d.NomeInformante||'', d.relacao||'Professor(a)', d.idade||'',
      d.score_IN!==undefined?d.score_IN:'', d.score_HI!==undefined?d.score_HI:'',
      d.score_LPEF!==undefined?d.score_LPEF:'',
      d.score_AG!==undefined?d.score_AG:'', d.score_PR!==undefined?d.score_PR:'',
      d.score_DSMI!==undefined?d.score_DSMI:'', d.score_DSMH!==undefined?d.score_DSMH:'',
      d.score_CD!==undefined?d.score_CD:'', d.score_ODD!==undefined?d.score_ODD:'',
      d.t_IN!==undefined?d.t_IN:'', d.t_HI!==undefined?d.t_HI:'',
      d.t_LPEF!==undefined?d.t_LPEF:'',
      d.t_AG!==undefined?d.t_AG:'', d.t_PR!==undefined?d.t_PR:'',
      d.t_DSMI!==undefined?d.t_DSMI:'', d.t_DSMH!==undefined?d.t_DSMH:'',
      d.t_CD!==undefined?d.t_CD:'', d.t_ODD!==undefined?d.t_ODD:'',
      d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'CONNERS3PS') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.NomeCrianca||'',
      d.nomeInformante||d.NomeInformante||'', d.relacao||'Pais', d.idade||'',
      d.score_IN!==undefined?d.score_IN:'', d.score_HI!==undefined?d.score_HI:'',
      d.score_LP!==undefined?d.score_LP:'', d.score_EF!==undefined?d.score_EF:'',
      d.score_AG!==undefined?d.score_AG:'', d.score_PR!==undefined?d.score_PR:'',
      d.t_IN!==undefined?d.t_IN:'', d.t_HI!==undefined?d.t_HI:'',
      d.t_LP!==undefined?d.t_LP:'', d.t_EF!==undefined?d.t_EF:'',
      d.t_AG!==undefined?d.t_AG:'', d.t_PR!==undefined?d.t_PR:'',
      d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'CONNERS3TS') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.NomeCrianca||'',
      d.nomeInformante||d.NomeInformante||'', d.relacao||'Professor(a)', d.idade||'',
      d.score_IN!==undefined?d.score_IN:'', d.score_HI!==undefined?d.score_HI:'',
      d.score_LPEF!==undefined?d.score_LPEF:'',
      d.score_AG!==undefined?d.score_AG:'', d.score_PR!==undefined?d.score_PR:'',
      d.t_IN!==undefined?d.t_IN:'', d.t_HI!==undefined?d.t_HI:'',
      d.t_LPEF!==undefined?d.t_LPEF:'',
      d.t_AG!==undefined?d.t_AG:'', d.t_PR!==undefined?d.t_PR:'',
      d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'FAD_GF') {
    return [
      hoje, d.patientCode||d.codigo||'', d.childName||d.nomeCrianca||'',
      d.respondent||d.relacao||'', d.respondentName||d.nomeRespondente||'',
      d.score||'', d.classification||d.classificacao||'', d.answers||''
    ];
  }

  if (abaNome === 'FAD_60') {
    return [
      hoje, d.patientCode||d.codigo||'', d.childName||d.nomeCrianca||'',
      d.respondent||d.relacao||'', d.respondentName||d.nomeRespondente||'',
      d.score_PS!==undefined?d.score_PS:'', d.score_CO!==undefined?d.score_CO:'',
      d.score_RO!==undefined?d.score_RO:'', d.score_AR!==undefined?d.score_AR:'',
      d.score_AI!==undefined?d.score_AI:'', d.score_BC!==undefined?d.score_BC:'',
      d.score_GF!==undefined?d.score_GF:'',
      d.class_PS||'', d.class_CO||'', d.class_RO||'', d.class_AR||'',
      d.class_AI||'', d.class_BC||'', d.class_GF||'',
      d.answers||''
    ];
  }

  if (abaNome === 'MAP_Parental') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.nomeProgenitor||d.nome||'', d.relacao||'', d.sitFamiliar||'',
      d.idadesFilhos||'',
      d.likert_media!==undefined?d.likert_media:'', d.principios||'',
      d.n_dominios_melhorias!==undefined?d.n_dominios_melhorias:'',
      d.n_dominios_bem!==undefined?d.n_dominios_bem:'',
      d.n_rotinas_melhorias!==undefined?d.n_rotinas_melhorias:'',
      d.s6_q1||'', d.s6_q2||'', d.s6_q3||'', d.s6_q4||'',
      d.s7_urgentes||'', d.s7_inadmissiveis||'',
      d.s7_rotinasFund||'', d.s7_mudancas||'',
      d.dados_completos||d.answers||''
    ];
  }

  if (abaNome === 'MAP_Parental_PI') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.nomeProgenitor||d.nome||'', d.relacao||'', d.sitFamiliar||'',
      d.contextoCuidados||'', d.idadesFilhos||'',
      d.likert_media!==undefined?d.likert_media:'', d.principios||'',
      d.n_dominios_melhorias!==undefined?d.n_dominios_melhorias:'',
      d.n_rotinas_melhorias!==undefined?d.n_rotinas_melhorias:'',
      d.s6_q1||'', d.s6_q2||'', d.s6_q3||'', d.s6_q4||'',
      d.s7_urgentes||'', d.s7_inadmissiveis||'',
      d.s7_rotinasFund||'', d.s7_mudancas||'',
      d.dados_completos||d.answers||''
    ];
  }

  if (abaNome === 'MAP_Parental_1214') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.nomeProgenitor||d.nome||'', d.relacao||'', d.sitFamiliar||'',
      d.idadesFilhos||'',
      d.likert_media!==undefined?d.likert_media:'', d.principios||'',
      d.n_dominios_melhorias!==undefined?d.n_dominios_melhorias:'',
      d.n_rotinas_melhorias!==undefined?d.n_rotinas_melhorias:'',
      d.s6_q1||'', d.s6_q2||'', d.s6_q3||'', d.s6_q4||'',
      d.s7_urgentes||'', d.s7_inadmissiveis||'',
      d.s7_rotinasFund||'', d.s7_mudancas||'',
      d.dados_completos||d.answers||''
    ];
  }

  if (abaNome === 'MAP_Parental_1518') {
    return [
      hoje, d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.nomeProgenitor||d.nome||'', d.relacao||'', d.sitFamiliar||'',
      d.idadesFilhos||'',
      d.likert_media!==undefined?d.likert_media:'', d.principios||'',
      d.n_dominios_melhorias!==undefined?d.n_dominios_melhorias:'',
      d.n_rotinas_melhorias!==undefined?d.n_rotinas_melhorias:'',
      d.s6_q1||'', d.s6_q2||'', d.s6_q3||'', d.s6_q4||'',
      d.s7_urgentes||'', d.s7_inadmissiveis||'',
      d.s7_rotinasFund||'', d.s7_mudancas||'',
      d.dados_completos||d.answers||''
    ];
  }

  if (abaNome === 'Anamnese_Complementar') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.nome_informante||d.nomeInformante||'',
      d.respondidas!==undefined?d.respondidas:'',
      d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'PAIA') {
    var PAI_A_SCALES = ['ICN','INF','NIM','PIM','SOM','ANS','DEP','MAN',
                        'PAR','ESQ','BPD','ANT','ALC','DRG','AGR','SUI',
                        'STR','NON','RXR'];
    var paia_row = [
      d.Código||d.patientCode||d.codigo||'',
      d.NomePaciente||d.nomeCrianca||d.nome||'',
      d.NomeRespondente||d.nome_preenche||d.nomeRespondente||'',
      d.Sexo||d.sexo||'', d.Idade||d.idade||'', d.Escola||d.escola||'',
      d.Data||hoje, d.Timestamp||new Date().toISOString()
    ];
    PAI_A_SCALES.forEach(function(sc) {
      paia_row.push(d['T_'+sc]!==undefined?d['T_'+sc]:'');
      paia_row.push(d['Raw_'+sc]!==undefined?d['Raw_'+sc]:'');
    });
    paia_row.push(d.Respostas||d.respostas||d.answers||'');
    return paia_row;
  }

  if (abaNome === 'PAI') {
    var PAI_SCALES = ['SOM','ANX','ARD','DEP','MAN','PAR','SCZ','BOR',
                      'ANT','ALC','DRG','AGG','SUI','STR','NON','RXR',
                      'DOM','WRM'];
    var pai_row = [
      d.Código||d.patientCode||d.codigo||'',
      d.NomePaciente||d.nomeCrianca||d.nome||'',
      d.NomeRespondente||d.nome_preenche||d.nomeRespondente||'',
      d.Sexo||d.sexo||'', d.DataNasc||d.dob||'',
      d.Data||hoje, d.Timestamp||new Date().toISOString()
    ];
    PAI_SCALES.forEach(function(sc) {
      pai_row.push(d['T_'+sc]!==undefined?d['T_'+sc]:'');
      pai_row.push(d['Raw_'+sc]!==undefined?d['Raw_'+sc]:'');
    });
    pai_row.push(d.Respostas||d.respostas||d.answers||'');
    return pai_row;
  }

  if (abaNome === 'MBI_SS') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.nomeCrianca||d.childName||'',
      d.nome_informante||d.nomeRespondente||'',
      d.Curso||d.curso||'', d.Ano||d.ano||'',
      d.EX!==undefined?d.EX:'', d.DC!==undefined?d.DC:'', d.EF!==undefined?d.EF:'',
      d.Diagnostico||d.diag||'',
      d.Respostas||d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'PS2_Cuidador') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.nomeCrianca||d.NomeCrianca||'',
      d.NomeInformante||d.nomeInformante||'', d.Relacao||d.relacao||'',
      d.Procura!==undefined?d.Procura:'', d.Evitamento!==undefined?d.Evitamento:'',
      d.Sensibilidade!==undefined?d.Sensibilidade:'', d.Registo!==undefined?d.Registo:'',
      d.Auditivo!==undefined?d.Auditivo:'', d.Visual!==undefined?d.Visual:'',
      d.Tatil!==undefined?d.Tatil:'', d.Movimento!==undefined?d.Movimento:'',
      d.Posicao!==undefined?d.Posicao:'', d.Oral!==undefined?d.Oral:'',
      d.Conduta!==undefined?d.Conduta:'', d.Socioemocional!==undefined?d.Socioemocional:'',
      d.Atencao!==undefined?d.Atencao:'',
      d.ClassProcura||'', d.ClassEvitamento||'',
      d.ClassSensibilidade||'', d.ClassRegisto||'',
      d.Respostas||d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'PS2_Professor') {
    return [
      hoje,
      d.patientCode||d.codigo||'', d.nomeCrianca||d.NomeCrianca||'',
      d.NomeInformante||d.nomeInformante||'',
      d.AnoEscolar||d.anoEscolar||'', d.Frequencia||d.frequencia||'',
      d.Procura!==undefined?d.Procura:'', d.Evitamento!==undefined?d.Evitamento:'',
      d.Sensibilidade!==undefined?d.Sensibilidade:'', d.Registo!==undefined?d.Registo:'',
      d.Auditivo!==undefined?d.Auditivo:'', d.Visual!==undefined?d.Visual:'',
      d.Tatil!==undefined?d.Tatil:'', d.Movimento!==undefined?d.Movimento:'',
      d.Comportamento!==undefined?d.Comportamento:'',
      d.FatorEscolar1!==undefined?d.FatorEscolar1:'',
      d.FatorEscolar2!==undefined?d.FatorEscolar2:'',
      d.FatorEscolar3!==undefined?d.FatorEscolar3:'',
      d.FatorEscolar4!==undefined?d.FatorEscolar4:'',
      d.Respostas||d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'IPP_R') {
    return [
      hoje,
      d.patientCode||d.codigo||'',
      d.anoEscolar||d.Ano||'',
      d.totalA!==undefined?d.totalA:'', d.totalB!==undefined?d.totalB:'',
      d.totalC!==undefined?d.totalC:'', d.totalD!==undefined?d.totalD:'',
      d.Respostas||d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'IMC_C') {
    return [
      hoje,
      d.Código||d.patientCode||d.codigo||'',
      d.NomeCrianca||d.nomeCrianca||d.nome||'',
      d.AnoEscolar||d.anoEscolar||'',
      d.Preocupacao!==undefined?d.Preocupacao:(d.preocupacao!==undefined?d.preocupacao:''),
      d.Curiosidade!==undefined?d.Curiosidade:(d.curiosidade!==undefined?d.curiosidade:''),
      d.Confianca!==undefined?d.Confianca:(d.confianca!==undefined?d.confianca:''),
      d.Consulta!==undefined?d.Consulta:(d.consulta!==undefined?d.consulta:''),
      d.Total!==undefined?d.Total:(d.total!==undefined?d.total:''),
      d.Respostas||d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'IVP_Super') {
    function ivpSub(key, jsKey) {
      return d[key]!==undefined?d[key]:(d[jsKey]!==undefined?d[jsKey]:'');
    }
    return [
      hoje,
      d.Código||d.patientCode||d.codigo||'',
      d.NomeCrianca||d.nomeCrianca||d.nome||'',
      d.NomeRespondente||d.nomeRespondente||d.nomeInformante||'',
      d.AnoEscolar||d.anoEscolar||'',
      ivpSub('Criatividade','Criatividade'),
      ivpSub('Altruísmo','Altrusmo'),
      ivpSub('Estético','Esttico'),
      ivpSub('Estimulação Intelectual','Estimulao_Intelectual'),
      ivpSub('Êxito','xito'),
      ivpSub('Independência','Independncia'),
      ivpSub('Prestígio','Prestgio'),
      ivpSub('Direcção','Direco'),
      ivpSub('Económico','Econmico'),
      ivpSub('Segurança','Segurana'),
      ivpSub('Ambiente','Ambiente'),
      ivpSub('Relação com os Superiores','Relao_com_os_Superiores'),
      ivpSub('Relação com os Colegas','Relao_com_os_Colegas'),
      ivpSub('Variedade','Variedade'),
      ivpSub('Género de Vida','Gnero_de_Vida'),
      d.Respostas||d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'SDS_Holland') {
    var bp   = d.by_part||{};
    var act  = bp.II||bp.act||{};
    var comp = bp.III||bp.comp||{};
    var carr = bp.IV||bp.carr||{};
    var apt  = bp.V||bp.apt||{};
    var tot  = d.total||{};
    var resStr = d.answers||d.Respostas||d.respostas||'';
    if (typeof resStr==='object') resStr = JSON.stringify(resStr);
    return [
      hoje,
      d.codigo||d.patientCode||d.Código||'',
      d.nome_crianca||d.nomeCrianca||d.nome||'',
      d.data_nasc||d.dataNasc||d.dob||'',
      d.percurso||'', d.escola||'',
      d.codigo_holland||d.Código_Holland||d.codigoHolland||'',
      tot.R!==undefined?tot.R:'', tot.I!==undefined?tot.I:'',
      tot.A!==undefined?tot.A:'', tot.S!==undefined?tot.S:'',
      tot.E!==undefined?tot.E:'', tot.C!==undefined?tot.C:'',
      act.R!==undefined?act.R:'', act.I!==undefined?act.I:'',
      act.A!==undefined?act.A:'', act.S!==undefined?act.S:'',
      act.E!==undefined?act.E:'', act.C!==undefined?act.C:'',
      comp.R!==undefined?comp.R:'', comp.I!==undefined?comp.I:'',
      comp.A!==undefined?comp.A:'', comp.S!==undefined?comp.S:'',
      comp.E!==undefined?comp.E:'', comp.C!==undefined?comp.C:'',
      carr.R!==undefined?carr.R:'', carr.I!==undefined?carr.I:'',
      carr.A!==undefined?carr.A:'', carr.S!==undefined?carr.S:'',
      carr.E!==undefined?carr.E:'', carr.C!==undefined?carr.C:'',
      apt.R!==undefined?apt.R:'', apt.I!==undefined?apt.I:'',
      apt.A!==undefined?apt.A:'', apt.S!==undefined?apt.S:'',
      apt.E!==undefined?apt.E:'', apt.C!==undefined?apt.C:'',
      resStr
    ];
  }

  if (abaNome === 'JTCI_92') {
    return [
      hoje,
      d.patientCode||d.codigo||'',
      d.nomeCrianca||d.NomeCrianca||d.nome||'',
      d.nome_informante||d.nomeInformante||d.NomeInformante||'',
      d.dob||d.dataNasc||'',
      d.genero||d.gender||d.Genero||'',
      d.anoEscolar||d.AnoEscolar||'',
      d.NS!==undefined?d.NS:'',
      d.HA!==undefined?d.HA:'',
      d.RD!==undefined?d.RD:'',
      d.P!==undefined?d.P:'',
      d.SD!==undefined?d.SD:'',
      d.CO!==undefined?d.CO:'',
      d.answers||d.Respostas||d.respostas||''
    ];
  }

  if (abaNome === 'NEOPIR') {
    var FACETAS_IDS = [
      'N1','N2','N3','N4','N5','N6',
      'E1','E2','E3','E4','E5','E6',
      'O1','O2','O3','O4','O5','O6',
      'A1','A2','A3','A4','A5','A6',
      'C1','C2','C3','C4','C5','C6'
    ];
    var DOMINIOS_IDS = ['N','E','O','A','C'];
    var row_neopir = [
      hoje,
      d.patientCode||d.Código||d.codigo||'',
      d.NomeInformante||d.nomeInformante||d.nome_informante||'',
      d.Sexo||d.sexo||'',
      d.GrupoEtario||d.grupoEtario||d.grupo||'',
      d.DataAvaliacao||d.dataAvaliacao||hoje
    ];
    FACETAS_IDS.forEach(function(fid) {
      row_neopir.push(d['SB_'+fid]!==undefined?d['SB_'+fid]:'');
      row_neopir.push(d['PC_'+fid]!==undefined?d['PC_'+fid]:'');
    });
    DOMINIOS_IDS.forEach(function(did) {
      row_neopir.push(d['SB_'+did]!==undefined?d['SB_'+did]:'');
      row_neopir.push(d['PC_'+did]!==undefined?d['PC_'+did]:'');
    });
    row_neopir.push(d.Respostas||d.respostas||d.answers||'');
    return row_neopir;
  }

  if (abaNome === 'CSSRS') {
    return [
      hoje,
      d.patientCode||d.codigo||'',
      d.nome||d.nomeCrianca||d.childName||'',
      d.versao||'', d.avaliador||'', d.idade||'', d.contexto||'',
      d.ideacaoMaxTipo!==undefined?d.ideacaoMaxTipo:'',
      d.tentativaReal!==undefined?d.tentativaReal:'',
      d.tentativaInterrompida!==undefined?d.tentativaInterrompida:'',
      d.tentativaAbortada!==undefined?d.tentativaAbortada:'',
      d.actosPreparatorios!==undefined?d.actosPreparatorios:'',
      d.nivelRisco!==undefined?d.nivelRisco:'',
      d.nivelRiscoTexto||'', d.notas||'',
      d.respostas||d.Respostas||d.answers||''
    ];
  }

  if (abaNome === 'BSI') {
    return [
      hoje,
      d.patientCode||d.codigo||d.Codigo||d.Código||'',
      d.nomeCrianca||d.NomeCrianca||'',
      d.nomeInquirido||d.NomeInquirido||d.nomeRespondente||'',
      d.grauParentesco||d.GrauParentesco||d.relacao||d['Relação']||'',
      d.IGS!==undefined?d.IGS:'',
      d.TSP!==undefined?d.TSP:'',
      d.ISP!==undefined?d.ISP:'',
      d.Som!==undefined?d.Som:'',
      d.ObsComp!==undefined?d.ObsComp:'',
      d.SensInt!==undefined?d.SensInt:'',
      d.Dep!==undefined?d.Dep:'',
      d.Ans!==undefined?d.Ans:'',
      d.Hos!==undefined?d.Hos:'',
      d.AnsFob!==undefined?d.AnsFob:'',
      d.IdeaPar!==undefined?d.IdeaPar:'',
      d.Psic!==undefined?d.Psic:'',
      d.answers||d.Answers||d.Respostas||d.respostas||''
    ];
  }

  if (abaNome === 'BESAA') {
    return [
      hoje,
      d.patientCode||d.codigo||d.Código||'',
      d.nome_crianca||d.nomeCrianca||d.nome_respondente||d.NomeRespondente||'',
      d.nome_informante||d.nomeRespondente||'',
      d.genero||d.Genero||d.sexo||d.Sexo||'',
      '',
      d.aparScore!==undefined?d.aparScore:'',
      d.pesoScore!==undefined?d.pesoScore:'',
      d.atribScore!==undefined?d.atribScore:'',
      d.total!==undefined?d.total:'',
      '',
      '',
      d.answers||d.Respostas||d.respostas||''
    ];
  }

  if (abaNome === 'EDEQ') {
    return [
      hoje,
      d.patientCode||d.codigo||'',
      d.nome||d.Nome||'',
      d.dataNascimento||d.DataNascimento||'',
      d.sexo||d.Sexo||'',
      d.restraint!==undefined?d.restraint:'',
      d.eatingConcern!==undefined?d.eatingConcern:'',
      d.shapeConcern!==undefined?d.shapeConcern:'',
      d.weightConcern!==undefined?d.weightConcern:'',
      d.global!==undefined?d.global:'',
      d.q13_obe!==undefined?d.q13_obe:'',
      d.q14_obe_ctrl!==undefined?d.q14_obe_ctrl:'',
      d.q15_dias_obe!==undefined?d.q15_dias_obe:'',
      d.q16_vomito!==undefined?d.q16_vomito:'',
      d.q17_laxantes!==undefined?d.q17_laxantes:'',
      d.q18_exercicio!==undefined?d.q18_exercicio:'',
      d.answers||d.Respostas||''
    ];
  }

  if (abaNome === 'SEQ_C') {
    return [
      hoje,
      d['Código']||d.patientCode||d.codigo||'',
      d['NomeCriança']||d.nomeCrianca||d.NomeCrianca||'',
      d.Idade||d.idade||'',
      d.AnoEscolar||d.anoEscolar||'',
      d['Género']||d.genero||'',
      d['Retenções']||d.retencoes||'',
      d.AE_Acad!==undefined?d.AE_Acad:'',
      d.AE_Social!==undefined?d.AE_Social:'',
      d.AE_Emoc!==undefined?d.AE_Emoc:'',
      d.AE_Global!==undefined?d.AE_Global:'',
      d.ZonaAcad||'', d.ZonaSocial||'', d.ZonaEmoc||'', d.ZonaGlobal||'',
      d.MediaAcad!==undefined?d.MediaAcad:'',
      d.MediaSocial!==undefined?d.MediaSocial:'',
      d.MediaEmoc!==undefined?d.MediaEmoc:'',
      d.Respostas||d.respostas||d.answers||''
    ];
  }

  if (abaNome === 'Collins_Silhuetas') {
    return [
      hoje,
      d.patientCode||d.codigo||d['Código']||'',
      d.genero||d['Género']||'',
      d.idade||d.Idade||'',
      d.peso||d.Peso||'',
      d.altura||d.Altura||'',
      d.imc||d.IMC||'',
      d.grupo||d.Grupo||'',
      d.silReal!==undefined?d.silReal:'',
      d.silIdeal!==undefined?d.silIdeal:'',
      d.insatisfacao!==undefined?d.insatisfacao:'',
      d.avaliacao||d.Avaliacao||'',
      d.desejo||d.Desejo||''
    ];
  }

  if (abaNome === 'OBS_PHDA_Casa') {
    var sm = d.scores_manha || {};
    var st = d.scores_tarde || {};
    var sn = d.scores_noite || {};
    var sg = d.scores_global || {};
    function sv(o, k) { return o[k] !== undefined && o[k] !== null ? o[k] : ''; }
    return [
      hoje,
      d.code || d.patientCode || d.codigo || '',
      d.nomeCrianca || d.NomeCrianca || '',
      d.nomeInf || d.nomeInformante || d.NomeInformante || '',
      d.medicacao || '',
      d.Med1_Nome || '', d.Med1_Dose || '', d.Med1_Hora || '',
      d.Med2_Nome || '', d.Med2_Dose || '', d.Med2_Hora || '',
      d.Med3_Nome || '', d.Med3_Dose || '', d.Med3_Hora || '',
      sv(sm,'atencao'), sv(sm,'emocao'), sv(sm,'social'),
      sv(sm,'motora'),  sv(sm,'bestar'),
      sv(st,'atencao'), sv(st,'emocao'), sv(st,'social'),
      sv(st,'motora'),  sv(st,'bestar'),
      sv(sn,'atencao'), sv(sn,'emocao'),
      sv(sn,'motora'),  sv(sn,'bestar'),
      sv(sg,'atencao'), sv(sg,'emocao'), sv(sg,'social'),
      sv(sg,'motora'),  sv(sg,'bestar'),
      d.obsLivres || '',
      d.ts || new Date().toISOString()
    ];
  }

  if (abaNome === 'OBS_PHDA_Escola') {
    var sm2 = d.scores_manha || {};
    var st2 = d.scores_tarde || {};
    var sg2 = d.scores_global || {};
    function sv2(o, k) { return o[k] !== undefined && o[k] !== null ? o[k] : ''; }
    return [
      hoje,
      d.code || d.patientCode || d.codigo || '',
      d.nomeCrianca || d.NomeCrianca || '',
      d.nomeInf || d.nomeInformante || d.NomeInformante || '',
      d.anoEscolar || '',
      d.medicacao || '',
      d.Med_Contexto || '',
      d.Med1_Nome || '', d.Med1_Dose || '', d.Med1_Hora || '',
      d.Med2_Nome || '', d.Med2_Dose || '', d.Med2_Hora || '',
      d.Med3_Nome || '', d.Med3_Dose || '', d.Med3_Hora || '',
      sv2(sm2,'atencao'), sv2(sm2,'emocao'), sv2(sm2,'social'), sv2(sm2,'motora'),
      sv2(st2,'atencao'), sv2(st2,'emocao'), sv2(st2,'social'), sv2(st2,'motora'),
      sv2(sg2,'atencao'), sv2(sg2,'emocao'), sv2(sg2,'social'), sv2(sg2,'motora'),
      d.obsLivres || '',
      d.ts || new Date().toISOString()
    ];
  }

  if (abaNome === 'ECS') {
    var s = d.scores || {};
    return [
      hoje,
      d.patientCode || d.codigo || d['Código'] || '',
      d.nomeCrianca || d.NomeCrianca || d.nome || '',
      d.nomeRespondente || d.NomeRespondente || d.nome_informante || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.escolaridade || d.Escolaridade || '',
      d.estadoCivil || d['estado-civil'] || d.EstadoCivil || '',
      d.profissao || d.Profissao || '',
      (d.total !== undefined ? d.total : (s.Total !== undefined ? s.Total : '')),
      (d.adaptabilidade !== undefined ? d.adaptabilidade : (s.Adaptabilidade !== undefined ? s.Adaptabilidade : '')),
      (d.expressividade !== undefined ? d.expressividade : (s.Expressividade !== undefined ? s.Expressividade : '')),
      (d.mediaTotal !== undefined ? d.mediaTotal : (s.Media_Total !== undefined ? s.Media_Total : '')),
      (d.mediaAdapt !== undefined ? d.mediaAdapt : (s.Media_Adapt !== undefined ? s.Media_Adapt : '')),
      (d.mediaExpr  !== undefined ? d.mediaExpr  : (s.Media_Expr  !== undefined ? s.Media_Expr  : '')),
      (d.zTotal !== undefined ? d.zTotal : (s.Z_Total !== undefined ? s.Z_Total : '')),
      d.nivelTotal || s.Nivel_Total || '',
      d.nivelAdapt || s.Nivel_Adapt || '',
      d.nivelExpr  || s.Nivel_Expr  || '',
      d.respostas || d.Respostas || d.answers || ''
    ];
  }

  // ── DERS — Dificuldades de Regulação Emocional ───────────────
  if (abaNome === 'DERS') {
    return [
      hoje,
      d.patientCode || d.codigo || d['Código'] || '',
      d.nomeCrianca || d.NomeCrianca || d.nome_crianca || d.childName || '',
      d.nomeInformante || d.NomeInformante || d.nome_preenche || d.nomeRespondente || '',
      d.idade !== undefined ? d.idade : (d.Idade || ''),
      d.sexo || d.Sexo || d.gender || '',
      d.faixa || d.Faixa || '',
      // NA
      d.NA_Raw  !== undefined ? d.NA_Raw  : '',
      d.NA_Z    !== undefined ? d.NA_Z    : '',
      d.NA_Class || '',
      // OBJ
      d.OBJ_Raw !== undefined ? d.OBJ_Raw : '',
      d.OBJ_Z   !== undefined ? d.OBJ_Z   : '',
      d.OBJ_Class || '',
      // IMP
      d.IMP_Raw !== undefined ? d.IMP_Raw : '',
      d.IMP_Z   !== undefined ? d.IMP_Z   : '',
      d.IMP_Class || '',
      // CON
      d.CON_Raw !== undefined ? d.CON_Raw : '',
      d.CON_Z   !== undefined ? d.CON_Z   : '',
      d.CON_Class || '',
      // EST
      d.EST_Raw !== undefined ? d.EST_Raw : '',
      d.EST_Z   !== undefined ? d.EST_Z   : '',
      d.EST_Class || '',
      // CLA
      d.CLA_Raw !== undefined ? d.CLA_Raw : '',
      d.CLA_Z   !== undefined ? d.CLA_Z   : '',
      d.CLA_Class || '',
      // TOTAL
      d.TOT_Raw !== undefined ? d.TOT_Raw : '',
      d.TOT_Z   !== undefined ? d.TOT_Z   : '',
      d.TOT_Class || '',
      // Respostas item-a-item (JSON)
      d.Respostas || d.respostas || d.answers || ''
    ];
  }

  // ── COMPA — Escala de Avaliação da Comunicação na Parentalidade ──────────
  // (Portugal & Alberto, 2014) · Cinco versões. Score escala 1.00–5.00.
  // COMPA-P (44 itens, 5 subescalas) · COMPA-A Pai/Mãe (39, 5 subescalas, F5 valência neg)
  // COMPA-C Pai/Mãe (16 itens, 2 subescalas)
  // O HTML envia: F1, F2, F3, F4, F5, Total, Respostas (string com '|' como separador)
  if (abaNome === 'COMPA_P') {
    return [
      hoje, cod,
      d.nomeCrianca || d.NomeCrianca || '',
      d.nomeInformante || d.NomeInformante || '',
      d.relacao || d.Relacao || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.F1 || '', d.F2 || '', d.F3 || '', d.F4 || '', d.F5 || '',
      d.Total || d.total || '',
      d.Respostas || d.respostas || d.answers || ''
    ];
  }

  if (abaNome === 'COMPA_A_Pai' || abaNome === 'COMPA_A_Mae') {
    return [
      hoje, cod,
      d.nomeCrianca || d.NomeCrianca || '',
      d.nomeInformante || d.NomeInformante || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.F1 || '', d.F2 || '', d.F3 || '', d.F4 || '', d.F5 || '',
      d.Total || d.total || '',
      d.Respostas || d.respostas || d.answers || ''
    ];
  }

  if (abaNome === 'COMPA_C_Pai' || abaNome === 'COMPA_C_Mae') {
    return [
      hoje, cod,
      d.nomeCrianca || d.NomeCrianca || '',
      d.nomeInformante || d.NomeInformante || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.F1 || '', d.F2 || '',
      d.Total || d.total || '',
      d.Respostas || d.respostas || d.answers || ''
    ];
  }

  // ── CDI-2:SR — Inventário de Depressão em Crianças (Auto-relato) ───────
  // Kovacs & MHS Staff (2011) · 28 itens · 7-17 anos
  // O HTML envia: patientCode, nomeCrianca, nomeInformante, dob, sexo, idade,
  // grupoEtario, TOTAL_RAW, EP_RAW, FP_RAW, HM_SF_RAW, AE_RAW, INE_RAW, PI_RAW,
  // TOTAL_T, ITEM9, answers (string com '|' como separador)
  if (abaNome === 'CDI2_SR') {
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d['NomeCriança'] || '',
      d.nomeInformante || d.NomeInformante || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      d.sexo || d.Sexo || '',
      d.idade !== undefined && d.idade !== null ? d.idade : (d.Idade || ''),
      d.grupoEtario || d.GrupoEtario || d.grupo_etario || '',
      d.TOTAL_RAW !== undefined ? d.TOTAL_RAW : (d.totalRaw !== undefined ? d.totalRaw : ''),
      d.EP_RAW    !== undefined ? d.EP_RAW    : (d.epRaw    !== undefined ? d.epRaw    : ''),
      d.FP_RAW    !== undefined ? d.FP_RAW    : (d.fpRaw    !== undefined ? d.fpRaw    : ''),
      d.HM_SF_RAW !== undefined ? d.HM_SF_RAW : (d.hmsfRaw  !== undefined ? d.hmsfRaw  : ''),
      d.AE_RAW    !== undefined ? d.AE_RAW    : (d.aeRaw    !== undefined ? d.aeRaw    : ''),
      d.INE_RAW   !== undefined ? d.INE_RAW   : (d.ineRaw   !== undefined ? d.ineRaw   : ''),
      d.PI_RAW    !== undefined ? d.PI_RAW    : (d.piRaw    !== undefined ? d.piRaw    : ''),
      d.TOTAL_T   !== undefined && d.TOTAL_T !== null ? d.TOTAL_T : (d.totalT !== undefined ? d.totalT : ''),
      d.ITEM9     !== undefined && d.ITEM9   !== null ? d.ITEM9   : (d.item9  !== undefined ? d.item9  : ''),
      typeof d.answers === 'string' ? d.answers : (d.Respostas || d.respostas || JSON.stringify(d.answers || ''))
    ];
  }

  // ── STAIC C-2 — Inventário de Ansiedade Estado-Traço para Crianças (A-Traço) ──
  // Spielberger et al. (1973) · trad. PT Dias & Gonçalves (1999) · 20 itens · 8-17 anos
  // O HTML envia: patientCode, nomeCrianca, nomeInformante, DataNasc, Sexo, Idade,
  // TOTAL_RAW, Z_SPIELBERGER, Z_BIAGGIO, Z_DG_PT, SEXO_APLICADO_SPIEL, SEXO_APLICADO_DG,
  // CORTE_STRAUSS, CORTE_CONSERVADOR, CLASSIFICACAO, NORMA_PRIMARIA, Respostas
  // Cotação tecnicamente corrigida: APENAS item 4 invertido (item 5 NÃO invertido).
  if (abaNome === 'STAIC_C2') {
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d['NomeCriança'] || '',
      d.nomeInformante || d.NomeInformante || '',
      d.DataNasc || d.dataNasc || d.dob || '',
      d.Sexo || d.sexo || '',
      d.Idade !== undefined && d.Idade !== null ? d.Idade : (d.idade !== undefined ? d.idade : ''),
      d.TOTAL_RAW !== undefined ? d.TOTAL_RAW : (d.totalRaw !== undefined ? d.totalRaw : (d.raw !== undefined ? d.raw : '')),
      d.Z_SPIELBERGER !== undefined ? d.Z_SPIELBERGER : (d.zSpielberger !== undefined ? d.zSpielberger : ''),
      d.Z_BIAGGIO     !== undefined ? d.Z_BIAGGIO     : (d.zBiaggio     !== undefined ? d.zBiaggio     : ''),
      d.Z_DG_PT       !== undefined ? d.Z_DG_PT       : (d.Z_DG !== undefined ? d.Z_DG : (d.zDg !== undefined ? d.zDg : '')),
      d.SEXO_APLICADO_SPIEL !== undefined ? d.SEXO_APLICADO_SPIEL : (d.sexoAplicadoSpiel !== undefined ? d.sexoAplicadoSpiel : ''),
      d.SEXO_APLICADO_DG    !== undefined ? d.SEXO_APLICADO_DG    : (d.sexoAplicadoDg    !== undefined ? d.sexoAplicadoDg    : ''),
      d.CORTE_STRAUSS     !== undefined ? d.CORTE_STRAUSS     : (d.corteStrauss     !== undefined ? d.corteStrauss     : ''),
      d.CORTE_CONSERVADOR !== undefined ? d.CORTE_CONSERVADOR : (d.corteConservador !== undefined ? d.corteConservador : ''),
      d.CLASSIFICACAO  !== undefined ? d.CLASSIFICACAO  : (d.classificacao  !== undefined ? d.classificacao  : ''),
      d.NORMA_PRIMARIA !== undefined ? d.NORMA_PRIMARIA : (d.normaPrimaria  !== undefined ? d.normaPrimaria  : 'Spielberger 1973'),
      typeof d.answers === 'string' ? d.answers : (d.Respostas || d.respostas || JSON.stringify(d.answers || ''))
    ];
  }

  // ── CMAS-R — Questionário de Avaliação da Ansiedade Manifesta para Crianças ──
  // Reynolds & Richmond (1978) · trad. PT Dias & Gonçalves (1999) · 37 itens · 8-17 anos
  // O HTML envia: patientCode, nomeCrianca, nomeInformante, DataNasc, Sexo, Idade,
  // ANS_RAW, ANS_T, ANS_CLASSIF, LIE_RAW, LIE_T, LIE_CLASSIF, VALIDADE_OK, Respostas
  // Resposta binária Sim=1/Não=0 · sem itens invertidos · tabela T-score discreta
  if (abaNome === 'CMAS_R') {
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d['NomeCriança'] || '',
      d.nomeInformante || d.NomeInformante || '',
      d.DataNasc || d.dataNasc || d.dob || '',
      d.Sexo || d.sexo || '',
      d.Idade !== undefined && d.Idade !== null ? d.Idade : (d.idade !== undefined ? d.idade : ''),
      d.ANS_RAW !== undefined ? d.ANS_RAW : (d.ansRaw !== undefined ? d.ansRaw : ''),
      d.ANS_T   !== undefined && d.ANS_T !== null ? d.ANS_T : (d.ansT !== undefined ? d.ansT : ''),
      d.ANS_CLASSIF !== undefined ? d.ANS_CLASSIF : (d.ansClassif !== undefined ? d.ansClassif : ''),
      d.LIE_RAW !== undefined ? d.LIE_RAW : (d.lieRaw !== undefined ? d.lieRaw : ''),
      d.LIE_T   !== undefined && d.LIE_T !== null ? d.LIE_T : (d.lieT !== undefined ? d.lieT : ''),
      d.LIE_CLASSIF !== undefined ? d.LIE_CLASSIF : (d.lieClassif !== undefined ? d.lieClassif : ''),
      d.VALIDADE_OK !== undefined ? d.VALIDADE_OK : (d.validadeOK !== undefined ? d.validadeOK : ''),
      typeof d.answers === 'string' ? d.answers : (d.Respostas || d.respostas || JSON.stringify(d.answers || ''))
    ];
  }

  // ── FSSC-R — Inventário de Medos para Crianças (Revisto) ─────────────────
  // Ollendick (1978/1983) · trad. PT Dias & Gonçalves (1999) · 80 itens · 8-17 anos
  // O HTML envia: patientCode, nomeCrianca, nomeInformante, DataNasc, Sexo, Idade,
  // TOTAL_RAW_012, TOTAL_RAW_123, F1_RAW...F5_RAW (em 1-2-3),
  // Z_TOTAL_SANDIN/TURGEON/OLLENDICK/DG_PT, Z_F1...Z_F5 (Sandín),
  // MUITO_TOTAL, MUITO_F1...MUITO_F5, CLASSIF_MUITO,
  // SEXO_APLICADO_SANDIN, CLASSIFICACAO, NORMA_PRIMARIA, Respostas
  // Cotação dupla calculada em paralelo · estrutura factorial Ollendick (1983)
  if (abaNome === 'FSSC_R') {
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d['NomeCriança'] || '',
      d.nomeInformante || d.NomeInformante || '',
      d.DataNasc || d.dataNasc || d.dob || '',
      d.Sexo || d.sexo || '',
      d.Idade !== undefined && d.Idade !== null ? d.Idade : (d.idade !== undefined ? d.idade : ''),
      d.TOTAL_RAW_012 !== undefined ? d.TOTAL_RAW_012 : (d.total_012 !== undefined ? d.total_012 : ''),
      d.TOTAL_RAW_123 !== undefined ? d.TOTAL_RAW_123 : (d.total_123 !== undefined ? d.total_123 : ''),
      d.F1_RAW !== undefined ? d.F1_RAW : (d.f1 !== undefined ? d.f1 : ''),
      d.F2_RAW !== undefined ? d.F2_RAW : (d.f2 !== undefined ? d.f2 : ''),
      d.F3_RAW !== undefined ? d.F3_RAW : (d.f3 !== undefined ? d.f3 : ''),
      d.F4_RAW !== undefined ? d.F4_RAW : (d.f4 !== undefined ? d.f4 : ''),
      d.F5_RAW !== undefined ? d.F5_RAW : (d.f5 !== undefined ? d.f5 : ''),
      d.Z_TOTAL_SANDIN    !== undefined ? d.Z_TOTAL_SANDIN    : (d.zTotalSandin    !== undefined ? d.zTotalSandin    : ''),
      d.Z_TOTAL_TURGEON   !== undefined ? d.Z_TOTAL_TURGEON   : (d.zTotalTurgeon   !== undefined ? d.zTotalTurgeon   : ''),
      d.Z_TOTAL_OLLENDICK !== undefined ? d.Z_TOTAL_OLLENDICK : (d.zTotalOllendick !== undefined ? d.zTotalOllendick : ''),
      d.Z_TOTAL_DG_PT     !== undefined ? d.Z_TOTAL_DG_PT     : (d.zTotalDgPt      !== undefined ? d.zTotalDgPt      : ''),
      d.Z_F1 !== undefined ? d.Z_F1 : (d.zF1 !== undefined ? d.zF1 : ''),
      d.Z_F2 !== undefined ? d.Z_F2 : (d.zF2 !== undefined ? d.zF2 : ''),
      d.Z_F3 !== undefined ? d.Z_F3 : (d.zF3 !== undefined ? d.zF3 : ''),
      d.Z_F4 !== undefined ? d.Z_F4 : (d.zF4 !== undefined ? d.zF4 : ''),
      d.Z_F5 !== undefined ? d.Z_F5 : (d.zF5 !== undefined ? d.zF5 : ''),
      d.MUITO_TOTAL !== undefined ? d.MUITO_TOTAL : (d.muitoTotal !== undefined ? d.muitoTotal : ''),
      d.MUITO_F1 !== undefined ? d.MUITO_F1 : (d.muitoF1 !== undefined ? d.muitoF1 : ''),
      d.MUITO_F2 !== undefined ? d.MUITO_F2 : (d.muitoF2 !== undefined ? d.muitoF2 : ''),
      d.MUITO_F3 !== undefined ? d.MUITO_F3 : (d.muitoF3 !== undefined ? d.muitoF3 : ''),
      d.MUITO_F4 !== undefined ? d.MUITO_F4 : (d.muitoF4 !== undefined ? d.muitoF4 : ''),
      d.MUITO_F5 !== undefined ? d.MUITO_F5 : (d.muitoF5 !== undefined ? d.muitoF5 : ''),
      d.CLASSIF_MUITO !== undefined ? d.CLASSIF_MUITO : (d.classifMuito !== undefined ? d.classifMuito : ''),
      d.SEXO_APLICADO_SANDIN !== undefined ? d.SEXO_APLICADO_SANDIN : (d.sexoAplicadoSandin !== undefined ? d.sexoAplicadoSandin : ''),
      d.CLASSIFICACAO !== undefined ? d.CLASSIFICACAO : (d.classificacao !== undefined ? d.classificacao : ''),
      d.NORMA_PRIMARIA !== undefined ? d.NORMA_PRIMARIA : (d.normaPrimaria !== undefined ? d.normaPrimaria : 'Sandín & Chorot 1998'),
      typeof d.answers === 'string' ? d.answers : (d.Respostas || d.respostas || JSON.stringify(d.answers || ''))
    ];
  }

  // ── Sociograma · Mapa Social — v52.0 ─────────────────────────
  // Instrumento qualitativo/relacional — sem T-scores.
  // Moreno (1934) · Coie & Dodge (1988) · Bronfenbrenner (1979) ·
  // Cillessen & Marks (2011) · Resnick et al. (1997) · Hagerty et al. (1992)
  //
  // O HTML envia (collectPayload):
  //   patientCode, NomeCriança, NomeInformante, TipoRespondente,
  //   Idade, AnoTurma, TempoTurma,
  //   DensidadeApoio, Reciprocidade, SinaisExclusao, SentidoPertenca,
  //   AdultoConfianca, NRefugios, NEvitados, DiscrepanciaSelfOther,
  //   Flags (string com '|'), Respostas (JSON.stringify)
  //
  // Notas:
  //  • SentidoPertenca pode ser null (criança não respondeu) → preservar como ''
  //    em vez de 0 (0/10 é uma resposta válida com significado clínico distinto).
  //  • DiscrepanciaSelfOther idem (1-5 ou null).
  //  • Flags vem como string já com '|'; manter assim para reconstrução do array
  //    no painel clínico via .split('|').
  if (abaNome === 'SOCIOGRAMA') {
    var pertenca = d.SentidoPertenca;
    var sentidoPertencaCol = (pertenca === null || pertenca === undefined || pertenca === '')
                             ? '' : pertenca;
    var discrep = d.DiscrepanciaSelfOther;
    var discrepCol = (discrep === null || discrep === undefined || discrep === '')
                     ? '' : discrep;
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d['NomeCriança'] || d.NomeCrianca || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.TipoRespondente || d.tipoRespondente || '',
      d.Idade !== undefined && d.Idade !== null ? d.Idade : (d.idade || ''),
      d.AnoTurma || d.anoTurma || '',
      d.TempoTurma || d.tempoTurma || '',
      d.DensidadeApoio !== undefined && d.DensidadeApoio !== null ? d.DensidadeApoio : 0,
      d.Reciprocidade  !== undefined && d.Reciprocidade  !== null ? d.Reciprocidade  : 0,
      d.SinaisExclusao !== undefined && d.SinaisExclusao !== null ? d.SinaisExclusao : 0,
      sentidoPertencaCol,
      d.AdultoConfianca || '',
      d.NRefugios !== undefined && d.NRefugios !== null ? d.NRefugios : 0,
      d.NEvitados !== undefined && d.NEvitados !== null ? d.NEvitados : 0,
      discrepCol,
      typeof d.Flags === 'string' ? d.Flags : (Array.isArray(d.Flags) ? d.Flags.join('|') : ''),
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── PALS_Parent — v53.0 ──────────────────────────────────────
  // Midgley et al. (2000) · 37 itens · adaptação portuguesa.
  // Payload do HTML envia: instrumento='PALS_Parent', Codigo,
  // NomeCrianca, NomeInformante, relacao, idade_crianca,
  // ano_escolar, Respostas (JSON), e scores M_*, P_*, I_*.
  // Notas: M_P1_1 (não M_P1.1) — pontos convertidos no payload.
  if (abaNome === 'PALS_Parent') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.relacao || d.Relacao || '',
      d.idade_crianca !== undefined && d.idade_crianca !== null ? d.idade_crianca : (d.IdadeCrianca || ''),
      d.ano_escolar || d.AnoEscolar || '',
      d.M_P1_1 !== undefined ? d.M_P1_1 : '',
      d.M_P1_2 !== undefined ? d.M_P1_2 : '',
      d.M_P1_3 !== undefined ? d.M_P1_3 : '',
      d.M_P2_1 !== undefined ? d.M_P2_1 : '',
      d.M_P2_2 !== undefined ? d.M_P2_2 : '',
      d.M_P2_3 !== undefined ? d.M_P2_3 : '',
      d.M_P3   !== undefined ? d.M_P3   : '',
      d.M_P4   !== undefined ? d.M_P4   : '',
      d.P_POP  !== undefined && d.P_POP  !== null ? d.P_POP  : '',
      d.P_PCEP !== undefined && d.P_PCEP !== null ? d.P_PCEP : '',
      d.I_IFP   !== undefined && d.I_IFP   !== null ? d.I_IFP   : '',
      d.I_IPCA  !== undefined && d.I_IPCA  !== null ? d.I_IPCA  : '',
      d.I_IRPA  !== undefined && d.I_IRPA  !== null ? d.I_IRPA  : '',
      d.I_ICEFM !== undefined && d.I_ICEFM !== null ? d.I_ICEFM : '',
      d.I_ICEFP !== undefined && d.I_ICEFP !== null ? d.I_ICEFP : '',
      d.I_IRPF  !== undefined && d.I_IRPF  !== null ? d.I_IRPF  : '',
      d.I_IIP   !== undefined && d.I_IIP   !== null ? d.I_IIP   : '',
      d.I_IPI   !== undefined && d.I_IPI   !== null ? d.I_IPI   : '',
      d.I_IDC   !== undefined && d.I_IDC   !== null ? d.I_IDC   : '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── PALS_Teacher — v53.0 ─────────────────────────────────────
  // Midgley et al. (2000) · 38 itens · adaptação portuguesa.
  // Extras: relacao (DT/Titular/Disciplina/EE), disciplina,
  // anos_experiencia.
  if (abaNome === 'PALS_Teacher') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.relacao || d.Relacao || '',
      d.disciplina || d.Disciplina || '',
      d.anos_experiencia !== undefined && d.anos_experiencia !== null ? d.anos_experiencia : (d.AnosExperiencia || ''),
      d.M_T1_1 !== undefined ? d.M_T1_1 : '',
      d.M_T1_2 !== undefined ? d.M_T1_2 : '',
      d.M_T1_3 !== undefined ? d.M_T1_3 : '',
      d.M_T2_1 !== undefined ? d.M_T2_1 : '',
      d.M_T2_2 !== undefined ? d.M_T2_2 : '',
      d.M_T3   !== undefined ? d.M_T3   : '',
      d.M_T4   !== undefined ? d.M_T4   : '',
      d.P_PCS !== undefined && d.P_PCS !== null ? d.P_PCS : '',
      d.P_PCI !== undefined && d.P_PCI !== null ? d.P_PCI : '',
      d.I_IFD  !== undefined && d.I_IFD  !== null ? d.I_IFD  : '',
      d.I_ICA  !== undefined && d.I_ICA  !== null ? d.I_ICA  : '',
      d.I_ICP  !== undefined && d.I_ICP  !== null ? d.I_ICP  : '',
      d.I_IRP  !== undefined && d.I_IRP  !== null ? d.I_IRP  : '',
      d.I_IRBD !== undefined && d.I_IRBD !== null ? d.I_IRBD : '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── PALS_Student_Sec — v53.0 ─────────────────────────────────
  // Midgley et al. (2000) · 84 itens · 14-18 anos.
  // Inclui dimensão vocacional (D3) + perfil P8.
  // Eixos motivacionais 2×2: approx, evit, dom, desemp.
  if (abaNome === 'PALS_Student_Sec') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade !== undefined && d.idade !== null ? d.idade : (d.Idade || ''),
      d.ano_escolar || d.AnoEscolar || '',
      d.genero || d.Genero || '',
      d.M_A1 !== undefined ? d.M_A1 : '',
      d.M_A2 !== undefined ? d.M_A2 : '',
      d.M_A3 !== undefined ? d.M_A3 : '',
      d.M_A4 !== undefined ? d.M_A4 : '',
      d.M_B1 !== undefined ? d.M_B1 : '',
      d.M_B2 !== undefined ? d.M_B2 : '',
      d.M_B3 !== undefined ? d.M_B3 : '',
      d.M_C1 !== undefined ? d.M_C1 : '',
      d.M_C2 !== undefined ? d.M_C2 : '',
      d.M_C3 !== undefined ? d.M_C3 : '',
      d.M_C4 !== undefined ? d.M_C4 : '',
      d.M_C5 !== undefined ? d.M_C5 : '',
      d.M_C6 !== undefined ? d.M_C6 : '',
      d.M_C7 !== undefined ? d.M_C7 : '',
      d.M_D1 !== undefined ? d.M_D1 : '',
      d.M_D2 !== undefined ? d.M_D2 : '',
      d.M_D3 !== undefined ? d.M_D3 : '',
      d.M_D4 !== undefined ? d.M_D4 : '',
      d.I_IFAA  !== undefined && d.I_IFAA  !== null ? d.I_IFAA  : '',
      d.I_IRM   !== undefined && d.I_IRM   !== null ? d.I_IRM   : '',
      d.I_IEA   !== undefined && d.I_IEA   !== null ? d.I_IEA   : '',
      d.I_IDPCm !== undefined && d.I_IDPCm !== null ? d.I_IDPCm : '',
      d.I_IDPCp !== undefined && d.I_IDPCp !== null ? d.I_IDPCp : '',
      d.E_approx !== undefined && d.E_approx !== null ? d.E_approx : '',
      d.E_evit   !== undefined && d.E_evit   !== null ? d.E_evit   : '',
      d.E_dom    !== undefined && d.E_dom    !== null ? d.E_dom    : '',
      d.E_desemp !== undefined && d.E_desemp !== null ? d.E_desemp : '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── PALS_Student_23c — v53.0 ─────────────────────────────────
  // Midgley et al. (2000) · 84 itens · 10-14 anos.
  // Estrutura idêntica ao Sec mas linguagem adaptada (B3, C5,
  // C6, C7) e sem perfil P8 nem alerta dissonância vocacional.
  if (abaNome === 'PALS_Student_23c') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade !== undefined && d.idade !== null ? d.idade : (d.Idade || ''),
      d.ano_escolar || d.AnoEscolar || '',
      d.genero || d.Genero || '',
      d.M_A1 !== undefined ? d.M_A1 : '',
      d.M_A2 !== undefined ? d.M_A2 : '',
      d.M_A3 !== undefined ? d.M_A3 : '',
      d.M_A4 !== undefined ? d.M_A4 : '',
      d.M_B1 !== undefined ? d.M_B1 : '',
      d.M_B2 !== undefined ? d.M_B2 : '',
      d.M_B3 !== undefined ? d.M_B3 : '',
      d.M_C1 !== undefined ? d.M_C1 : '',
      d.M_C2 !== undefined ? d.M_C2 : '',
      d.M_C3 !== undefined ? d.M_C3 : '',
      d.M_C4 !== undefined ? d.M_C4 : '',
      d.M_C5 !== undefined ? d.M_C5 : '',
      d.M_C6 !== undefined ? d.M_C6 : '',
      d.M_C7 !== undefined ? d.M_C7 : '',
      d.M_D1 !== undefined ? d.M_D1 : '',
      d.M_D2 !== undefined ? d.M_D2 : '',
      d.M_D3 !== undefined ? d.M_D3 : '',
      d.M_D4 !== undefined ? d.M_D4 : '',
      d.I_IFAA  !== undefined && d.I_IFAA  !== null ? d.I_IFAA  : '',
      d.I_IRM   !== undefined && d.I_IRM   !== null ? d.I_IRM   : '',
      d.I_IEA   !== undefined && d.I_IEA   !== null ? d.I_IEA   : '',
      d.I_IDPCm !== undefined && d.I_IDPCm !== null ? d.I_IDPCm : '',
      d.I_IDPCp !== undefined && d.I_IDPCp !== null ? d.I_IDPCp : '',
      d.E_approx !== undefined && d.E_approx !== null ? d.E_approx : '',
      d.E_evit   !== undefined && d.E_evit   !== null ? d.E_evit   : '',
      d.E_dom    !== undefined && d.E_dom    !== null ? d.E_dom    : '',
      d.E_desemp !== undefined && d.E_desemp !== null ? d.E_desemp : '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ──────────────────────────────────────────────────────────────
  //  PALS — VERSÕES REDUZIDAS (v55.0)
  //  Estrutura factorial idêntica às versões completas (mesmas
  //  colunas) — só muda o nome da aba. Helpers v() são null-safe
  //  (não colapsam zeros, ao contrário do operador || tradicional).
  // ──────────────────────────────────────────────────────────────

  // ── PALS_Parent_Red — 21 itens ─────────────────────────────────
  if (abaNome === 'PALS_Parent_Red') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.relacao || d.Relacao || '',
      d.idade_crianca !== undefined && d.idade_crianca !== null ? d.idade_crianca : (d.IdadeCrianca || ''),
      d.ano_escolar || d.AnoEscolar || '',
      d.M_P1_1 !== undefined ? d.M_P1_1 : '',
      d.M_P1_2 !== undefined ? d.M_P1_2 : '',
      d.M_P1_3 !== undefined ? d.M_P1_3 : '',
      d.M_P2_1 !== undefined ? d.M_P2_1 : '',
      d.M_P2_2 !== undefined ? d.M_P2_2 : '',
      d.M_P2_3 !== undefined ? d.M_P2_3 : '',
      d.M_P3   !== undefined ? d.M_P3   : '',
      d.M_P4   !== undefined ? d.M_P4   : '',
      d.P_POP  !== undefined && d.P_POP  !== null ? d.P_POP  : '',
      d.P_PCEP !== undefined && d.P_PCEP !== null ? d.P_PCEP : '',
      d.I_IFP   !== undefined && d.I_IFP   !== null ? d.I_IFP   : '',
      d.I_IPCA  !== undefined && d.I_IPCA  !== null ? d.I_IPCA  : '',
      d.I_IRPA  !== undefined && d.I_IRPA  !== null ? d.I_IRPA  : '',
      d.I_ICEFM !== undefined && d.I_ICEFM !== null ? d.I_ICEFM : '',
      d.I_ICEFP !== undefined && d.I_ICEFP !== null ? d.I_ICEFP : '',
      d.I_IRPF  !== undefined && d.I_IRPF  !== null ? d.I_IRPF  : '',
      d.I_IIP   !== undefined && d.I_IIP   !== null ? d.I_IIP   : '',
      d.I_IPI   !== undefined && d.I_IPI   !== null ? d.I_IPI   : '',
      d.I_IDC   !== undefined && d.I_IDC   !== null ? d.I_IDC   : '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── PALS_Teacher_Red — 20 itens ────────────────────────────────
  if (abaNome === 'PALS_Teacher_Red') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.relacao || d.Relacao || '',
      d.disciplina || d.Disciplina || '',
      d.anos_experiencia !== undefined && d.anos_experiencia !== null ? d.anos_experiencia : (d.AnosExperiencia || ''),
      d.M_T1_1 !== undefined ? d.M_T1_1 : '',
      d.M_T1_2 !== undefined ? d.M_T1_2 : '',
      d.M_T1_3 !== undefined ? d.M_T1_3 : '',
      d.M_T2_1 !== undefined ? d.M_T2_1 : '',
      d.M_T2_2 !== undefined ? d.M_T2_2 : '',
      d.M_T3   !== undefined ? d.M_T3   : '',
      d.M_T4   !== undefined ? d.M_T4   : '',
      d.P_PCS !== undefined && d.P_PCS !== null ? d.P_PCS : '',
      d.P_PCI !== undefined && d.P_PCI !== null ? d.P_PCI : '',
      d.I_IFD  !== undefined && d.I_IFD  !== null ? d.I_IFD  : '',
      d.I_ICA  !== undefined && d.I_ICA  !== null ? d.I_ICA  : '',
      d.I_ICP  !== undefined && d.I_ICP  !== null ? d.I_ICP  : '',
      d.I_IRP  !== undefined && d.I_IRP  !== null ? d.I_IRP  : '',
      d.I_IRBD !== undefined && d.I_IRBD !== null ? d.I_IRBD : '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── PALS_Student_Sec_Red — 46 itens · 14-18 anos · inclui P8 ───
  if (abaNome === 'PALS_Student_Sec_Red') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade !== undefined && d.idade !== null ? d.idade : (d.Idade || ''),
      d.ano_escolar || d.AnoEscolar || '',
      d.genero || d.Genero || '',
      d.M_A1 !== undefined ? d.M_A1 : '',
      d.M_A2 !== undefined ? d.M_A2 : '',
      d.M_A3 !== undefined ? d.M_A3 : '',
      d.M_A4 !== undefined ? d.M_A4 : '',
      d.M_B1 !== undefined ? d.M_B1 : '',
      d.M_B2 !== undefined ? d.M_B2 : '',
      d.M_B3 !== undefined ? d.M_B3 : '',
      d.M_C1 !== undefined ? d.M_C1 : '',
      d.M_C2 !== undefined ? d.M_C2 : '',
      d.M_C3 !== undefined ? d.M_C3 : '',
      d.M_C4 !== undefined ? d.M_C4 : '',
      d.M_C5 !== undefined ? d.M_C5 : '',
      d.M_C6 !== undefined ? d.M_C6 : '',
      d.M_C7 !== undefined ? d.M_C7 : '',
      d.M_D1 !== undefined ? d.M_D1 : '',
      d.M_D2 !== undefined ? d.M_D2 : '',
      d.M_D3 !== undefined ? d.M_D3 : '',
      d.M_D4 !== undefined ? d.M_D4 : '',
      d.I_IFAA  !== undefined && d.I_IFAA  !== null ? d.I_IFAA  : '',
      d.I_IRM   !== undefined && d.I_IRM   !== null ? d.I_IRM   : '',
      d.I_IEA   !== undefined && d.I_IEA   !== null ? d.I_IEA   : '',
      d.I_IDPCm !== undefined && d.I_IDPCm !== null ? d.I_IDPCm : '',
      d.I_IDPCp !== undefined && d.I_IDPCp !== null ? d.I_IDPCp : '',
      d.E_approx !== undefined && d.E_approx !== null ? d.E_approx : '',
      d.E_evit   !== undefined && d.E_evit   !== null ? d.E_evit   : '',
      d.E_dom    !== undefined && d.E_dom    !== null ? d.E_dom    : '',
      d.E_desemp !== undefined && d.E_desemp !== null ? d.E_desemp : '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── PALS_Student_23c_Red — 46 itens · 10-14 anos · sem P8 ──────
  if (abaNome === 'PALS_Student_23c_Red') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade !== undefined && d.idade !== null ? d.idade : (d.Idade || ''),
      d.ano_escolar || d.AnoEscolar || '',
      d.genero || d.Genero || '',
      d.M_A1 !== undefined ? d.M_A1 : '',
      d.M_A2 !== undefined ? d.M_A2 : '',
      d.M_A3 !== undefined ? d.M_A3 : '',
      d.M_A4 !== undefined ? d.M_A4 : '',
      d.M_B1 !== undefined ? d.M_B1 : '',
      d.M_B2 !== undefined ? d.M_B2 : '',
      d.M_B3 !== undefined ? d.M_B3 : '',
      d.M_C1 !== undefined ? d.M_C1 : '',
      d.M_C2 !== undefined ? d.M_C2 : '',
      d.M_C3 !== undefined ? d.M_C3 : '',
      d.M_C4 !== undefined ? d.M_C4 : '',
      d.M_C5 !== undefined ? d.M_C5 : '',
      d.M_C6 !== undefined ? d.M_C6 : '',
      d.M_C7 !== undefined ? d.M_C7 : '',
      d.M_D1 !== undefined ? d.M_D1 : '',
      d.M_D2 !== undefined ? d.M_D2 : '',
      d.M_D3 !== undefined ? d.M_D3 : '',
      d.M_D4 !== undefined ? d.M_D4 : '',
      d.I_IFAA  !== undefined && d.I_IFAA  !== null ? d.I_IFAA  : '',
      d.I_IRM   !== undefined && d.I_IRM   !== null ? d.I_IRM   : '',
      d.I_IEA   !== undefined && d.I_IEA   !== null ? d.I_IEA   : '',
      d.I_IDPCm !== undefined && d.I_IDPCm !== null ? d.I_IDPCm : '',
      d.I_IDPCp !== undefined && d.I_IDPCp !== null ? d.I_IDPCp : '',
      d.E_approx !== undefined && d.E_approx !== null ? d.E_approx : '',
      d.E_evit   !== undefined && d.E_evit   !== null ? d.E_evit   : '',
      d.E_dom    !== undefined && d.E_dom    !== null ? d.E_dom    : '',
      d.E_desemp !== undefined && d.E_desemp !== null ? d.E_desemp : '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ──────────────────────────────────────────────────────────────
  //  QUESTIONÁRIOS ECOLÓGICOS REVISTOS (v56.0)
  //  Versão clínica revista · enquadramento bioecológico
  //  (Bronfenbrenner) + lógica multi-informador (ASEBA/Achenbach).
  //  Itens qualitativos guardados em colunas QualA-QualD.
  //  Helpers null-safe (não colapsam zeros).
  // ──────────────────────────────────────────────────────────────

  // ── QEE_Escola — 40 itens fechados + 4 qualitativos ────────────
  if (abaNome === 'QEE_Escola') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.data_nasc    || '',
      d.ano_turma    || '',
      d.funcao       || '',
      d.tempo_conhec || '',
      d.M_IPS !== undefined && d.M_IPS !== null ? d.M_IPS : '',
      d.M_SR  !== undefined && d.M_SR  !== null ? d.M_SR  : '',
      d.M_SI  !== undefined && d.M_SI  !== null ? d.M_SI  : '',
      d.M_RC  !== undefined && d.M_RC  !== null ? d.M_RC  : '',
      d.M_PDP !== undefined && d.M_PDP !== null ? d.M_PDP : '',
      d.M_FAA !== undefined && d.M_FAA !== null ? d.M_FAA : '',
      d.M_ACA !== undefined && d.M_ACA !== null ? d.M_ACA : '',
      d.M_FPC !== undefined && d.M_FPC !== null ? d.M_FPC : '',
      d.Idx_II   !== undefined && d.Idx_II   !== null ? d.Idx_II   : '',
      d.Idx_IE   !== undefined && d.Idx_IE   !== null ? d.Idx_IE   : '',
      d.Idx_IPD  !== undefined && d.Idx_IPD  !== null ? d.Idx_IPD  : '',
      d.Idx_IAG  !== undefined && d.Idx_IAG  !== null ? d.Idx_IAG  : '',
      d.Idx_IRP  !== undefined && d.Idx_IRP  !== null ? d.Idx_IRP  : '',
      d.Idx_IGPC !== undefined && d.Idx_IGPC !== null ? d.Idx_IGPC : '',
      d.QualA || '',
      d.QualB || '',
      d.QualC || '',
      d.QualD || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── QEP_Pais — 40 itens fechados + 4 qualitativos ──────────────
  if (abaNome === 'QEP_Pais') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.data_nasc   || '',
      d.ano_escolar || '',
      d.parentesco  || '',
      d.coabitacao  || '',
      d.M_IPS !== undefined && d.M_IPS !== null ? d.M_IPS : '',
      d.M_SR  !== undefined && d.M_SR  !== null ? d.M_SR  : '',
      d.M_SI  !== undefined && d.M_SI  !== null ? d.M_SI  : '',
      d.M_RC  !== undefined && d.M_RC  !== null ? d.M_RC  : '',
      d.M_PDP !== undefined && d.M_PDP !== null ? d.M_PDP : '',
      d.M_FAG !== undefined && d.M_FAG !== null ? d.M_FAG : '',
      d.M_ACA !== undefined && d.M_ACA !== null ? d.M_ACA : '',
      d.M_FPF !== undefined && d.M_FPF !== null ? d.M_FPF : '',
      d.Idx_II   !== undefined && d.Idx_II   !== null ? d.Idx_II   : '',
      d.Idx_IE   !== undefined && d.Idx_IE   !== null ? d.Idx_IE   : '',
      d.Idx_IPD  !== undefined && d.Idx_IPD  !== null ? d.Idx_IPD  : '',
      d.Idx_IAG  !== undefined && d.Idx_IAG  !== null ? d.Idx_IAG  : '',
      d.Idx_IRP  !== undefined && d.Idx_IRP  !== null ? d.Idx_IRP  : '',
      d.Idx_IGPC !== undefined && d.Idx_IGPC !== null ? d.Idx_IGPC : '',
      d.QualA || '',
      d.QualB || '',
      d.QualC || '',
      d.QualD || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── IIM_Hetero ──────────────────────────────────────────────
  if (abaNome === 'IIM_Hetero') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.data_nasc    || '',
      d.relacao      || '',
      d.tempo_conhec || '',
      d.M_LING  !== undefined && d.M_LING  !== null ? d.M_LING  : '',
      d.M_LOGM  !== undefined && d.M_LOGM  !== null ? d.M_LOGM  : '',
      d.M_ESPA  !== undefined && d.M_ESPA  !== null ? d.M_ESPA  : '',
      d.M_MUSI  !== undefined && d.M_MUSI  !== null ? d.M_MUSI  : '',
      d.M_CORP  !== undefined && d.M_CORP  !== null ? d.M_CORP  : '',
      d.M_INTER !== undefined && d.M_INTER !== null ? d.M_INTER : '',
      d.M_INTRA !== undefined && d.M_INTRA !== null ? d.M_INTRA : '',
      d.M_NATU  !== undefined && d.M_NATU  !== null ? d.M_NATU  : '',
      d.Idx_IIA  !== undefined && d.Idx_IIA  !== null ? d.Idx_IIA  : '',
      d.Idx_IIES !== undefined && d.Idx_IIES !== null ? d.Idx_IIES : '',
      d.Idx_IIP  !== undefined && d.Idx_IIP  !== null ? d.Idx_IIP  : '',
      d.Idx_IIN  !== undefined && d.Idx_IIN  !== null ? d.Idx_IIN  : '',
      d.Idx_IGM  !== undefined && d.Idx_IGM  !== null ? d.Idx_IGM  : '',
      d.Idx_IDE  !== undefined && d.Idx_IDE  !== null ? d.Idx_IDE  : '',
      d.Idx_DIE  !== undefined && d.Idx_DIE  !== null ? d.Idx_DIE  : '',
      d.Idx_DOM  || '',
      d.Perfil   || '',
      d.Alertas  || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── IIM_Criancas ────────────────────────────────────────────
  if (abaNome === 'IIM_Criancas') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade      || '',
      d.ano_escola || '',
      d.genero     || '',
      d.M_LING  !== undefined && d.M_LING  !== null ? d.M_LING  : '',
      d.M_LOGM  !== undefined && d.M_LOGM  !== null ? d.M_LOGM  : '',
      d.M_ESPA  !== undefined && d.M_ESPA  !== null ? d.M_ESPA  : '',
      d.M_MUSI  !== undefined && d.M_MUSI  !== null ? d.M_MUSI  : '',
      d.M_CORP  !== undefined && d.M_CORP  !== null ? d.M_CORP  : '',
      d.M_INTER !== undefined && d.M_INTER !== null ? d.M_INTER : '',
      d.M_INTRA !== undefined && d.M_INTRA !== null ? d.M_INTRA : '',
      d.M_NATU  !== undefined && d.M_NATU  !== null ? d.M_NATU  : '',
      d.Idx_IIA  !== undefined && d.Idx_IIA  !== null ? d.Idx_IIA  : '',
      d.Idx_IIES !== undefined && d.Idx_IIES !== null ? d.Idx_IIES : '',
      d.Idx_IIP  !== undefined && d.Idx_IIP  !== null ? d.Idx_IIP  : '',
      d.Idx_IIN  !== undefined && d.Idx_IIN  !== null ? d.Idx_IIN  : '',
      d.Idx_IGM  !== undefined && d.Idx_IGM  !== null ? d.Idx_IGM  : '',
      d.Idx_IDE  !== undefined && d.Idx_IDE  !== null ? d.Idx_IDE  : '',
      d.Idx_DIE  !== undefined && d.Idx_DIE  !== null ? d.Idx_DIE  : '',
      d.Idx_DOM  || '',
      d.Perfil   || '',
      d.Alertas  || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── IIM_AdolAdultos ─────────────────────────────────────────
  if (abaNome === 'IIM_AdolAdultos') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade        || '',
      d.escolaridade || '',
      d.genero       || '',
      d.M_LING  !== undefined && d.M_LING  !== null ? d.M_LING  : '',
      d.M_LOGM  !== undefined && d.M_LOGM  !== null ? d.M_LOGM  : '',
      d.M_ESPA  !== undefined && d.M_ESPA  !== null ? d.M_ESPA  : '',
      d.M_MUSI  !== undefined && d.M_MUSI  !== null ? d.M_MUSI  : '',
      d.M_CORP  !== undefined && d.M_CORP  !== null ? d.M_CORP  : '',
      d.M_INTER !== undefined && d.M_INTER !== null ? d.M_INTER : '',
      d.M_INTRA !== undefined && d.M_INTRA !== null ? d.M_INTRA : '',
      d.M_NATU  !== undefined && d.M_NATU  !== null ? d.M_NATU  : '',
      d.Idx_IIA  !== undefined && d.Idx_IIA  !== null ? d.Idx_IIA  : '',
      d.Idx_IIES !== undefined && d.Idx_IIES !== null ? d.Idx_IIES : '',
      d.Idx_IIP  !== undefined && d.Idx_IIP  !== null ? d.Idx_IIP  : '',
      d.Idx_IIN  !== undefined && d.Idx_IIN  !== null ? d.Idx_IIN  : '',
      d.Idx_IGM  !== undefined && d.Idx_IGM  !== null ? d.Idx_IGM  : '',
      d.Idx_IDE  !== undefined && d.Idx_IDE  !== null ? d.Idx_IDE  : '',
      d.Idx_DIE  !== undefined && d.Idx_DIE  !== null ? d.Idx_DIE  : '',
      d.Idx_DOM  || '',
      d.Perfil   || '',
      d.Alertas  || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── CERQ_K — Cognitive Emotion Regulation Questionnaire (Crianças) ──
  if (abaNome === 'CERQ_K') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade        || '',
      d.genero       || '',
      d.escolaridade || '',
      d.M_AUT !== undefined && d.M_AUT !== null ? d.M_AUT : '',
      d.M_ACE !== undefined && d.M_ACE !== null ? d.M_ACE : '',
      d.M_RUM !== undefined && d.M_RUM !== null ? d.M_RUM : '',
      d.M_RP  !== undefined && d.M_RP  !== null ? d.M_RP  : '',
      d.M_PLA !== undefined && d.M_PLA !== null ? d.M_PLA : '',
      d.M_REA !== undefined && d.M_REA !== null ? d.M_REA : '',
      d.M_CP  !== undefined && d.M_CP  !== null ? d.M_CP  : '',
      d.M_CAT !== undefined && d.M_CAT !== null ? d.M_CAT : '',
      d.M_CO  !== undefined && d.M_CO  !== null ? d.M_CO  : '',
      d.CERQ_P !== undefined && d.CERQ_P !== null ? d.CERQ_P : '',
      d.CERQ_N !== undefined && d.CERQ_N !== null ? d.CERQ_N : '',
      d.Tipologia || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── CERQ_18 — Versão Curta (Soares & Amaral, 2024) ──
  if (abaNome === 'CERQ_18') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade        || '',
      d.genero       || '',
      d.escolaridade || '',
      d.M_AUT !== undefined && d.M_AUT !== null ? d.M_AUT : '',
      d.M_ACE !== undefined && d.M_ACE !== null ? d.M_ACE : '',
      d.M_RUM !== undefined && d.M_RUM !== null ? d.M_RUM : '',
      d.M_RP  !== undefined && d.M_RP  !== null ? d.M_RP  : '',
      d.M_RPP !== undefined && d.M_RPP !== null ? d.M_RPP : '',
      d.M_CP  !== undefined && d.M_CP  !== null ? d.M_CP  : '',
      d.M_CAT !== undefined && d.M_CAT !== null ? d.M_CAT : '',
      d.M_CO  !== undefined && d.M_CO  !== null ? d.M_CO  : '',
      d.CERQ_P !== undefined && d.CERQ_P !== null ? d.CERQ_P : '',
      d.CERQ_N !== undefined && d.CERQ_N !== null ? d.CERQ_N : '',
      d.Tipologia || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── CERQ_36 — Versão Completa (Castro et al., 2013, adaptação PT) ──
  if (abaNome === 'CERQ_36') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade        || '',
      d.genero       || '',
      d.escolaridade || '',
      d.M_AUT !== undefined && d.M_AUT !== null ? d.M_AUT : '',
      d.M_ACE !== undefined && d.M_ACE !== null ? d.M_ACE : '',
      d.M_RUM !== undefined && d.M_RUM !== null ? d.M_RUM : '',
      d.M_RP  !== undefined && d.M_RP  !== null ? d.M_RP  : '',
      d.M_PLA !== undefined && d.M_PLA !== null ? d.M_PLA : '',
      d.M_REA !== undefined && d.M_REA !== null ? d.M_REA : '',
      d.M_CP  !== undefined && d.M_CP  !== null ? d.M_CP  : '',
      d.M_CAT !== undefined && d.M_CAT !== null ? d.M_CAT : '',
      d.M_CO  !== undefined && d.M_CO  !== null ? d.M_CO  : '',
      d.CERQ_P !== undefined && d.CERQ_P !== null ? d.CERQ_P : '',
      d.CERQ_N !== undefined && d.CERQ_N !== null ? d.CERQ_N : '',
      d.Tipologia || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── ERICA — Emotion Regulation Index for Children and Adolescents ──
  // MacDermott et al. (2010) · Adaptação PT: Reverendo & Machado (2010)
  if (abaNome === 'ERICA') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade       || '',
      d.genero      || '',
      d.ano_escolar || '',
      d.M_CE !== undefined && d.M_CE !== null ? d.M_CE : '',
      d.M_AE !== undefined && d.M_AE !== null ? d.M_AE : '',
      d.M_RS !== undefined && d.M_RS !== null ? d.M_RS : '',
      d.ERICA_M !== undefined && d.ERICA_M !== null ? d.ERICA_M : '',
      d.ERICA_S !== undefined && d.ERICA_S !== null ? d.ERICA_S : '',
      d.Tipologia || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── ERQ-CA — Emotion Regulation Questionnaire for Children and Adolescents ──
  // Gullone & Taffe (2012) · Tradução PT: Ana Nunes
  // 2 subescalas (RC adaptativa, SE menos adaptativa) · sem itens invertidos
  if (abaNome === 'ERQ_CA') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade       || '',
      d.genero      || '',
      d.ano_escolar || '',
      d.M_RC !== undefined && d.M_RC !== null ? d.M_RC : '',
      d.M_SE !== undefined && d.M_SE !== null ? d.M_SE : '',
      d.S_RC !== undefined && d.S_RC !== null ? d.S_RC : '',
      d.S_SE !== undefined && d.S_SE !== null ? d.S_SE : '',
      d.Tipologia || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── STAXI-NA — Inventário de Expressão de Raiva Estado-Traço ──
  // Del Barrio, Aluja & Spielberger (2004) · Tradução PT: Ana Nunes
  // 8 subescalas + 4 escalas globais · sem itens invertidos
  // Categoria: Externalização & Comportamento
  if (abaNome === 'STAXI_NA') {
    return [
      hoje,
      d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeCrianca || d['NomeCriança'] || d.nomeCrianca || nome || '',
      d.NomeInformante || d.nomeInformante || '',
      d.idade       || '',
      d.genero      || '',
      d.ano_escolar || '',
      // Subescalas (8)
      d.M_SR    !== undefined && d.M_SR    !== null ? d.M_SR    : '',
      d.M_RFV   !== undefined && d.M_RFV   !== null ? d.M_RFV   : '',
      d.M_TR    !== undefined && d.M_TR    !== null ? d.M_TR    : '',
      d.M_RR    !== undefined && d.M_RR    !== null ? d.M_RR    : '',
      d.M_EROUT !== undefined && d.M_EROUT !== null ? d.M_EROUT : '',
      d.M_ERIN  !== undefined && d.M_ERIN  !== null ? d.M_ERIN  : '',
      d.M_CROUT !== undefined && d.M_CROUT !== null ? d.M_CROUT : '',
      d.M_CRIN  !== undefined && d.M_CRIN  !== null ? d.M_CRIN  : '',
      // Escalas globais (4)
      d.M_ER  !== undefined && d.M_ER  !== null ? d.M_ER  : '',
      d.M_RT  !== undefined && d.M_RT  !== null ? d.M_RT  : '',
      d.M_EXR !== undefined && d.M_EXR !== null ? d.M_EXR : '',
      d.M_CR  !== undefined && d.M_CR  !== null ? d.M_CR  : '',
      d.Tipologia || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── MDQ — Mood Disorder Questionnaire (rastreio bipolar) ─────
  // Hirschfeld et al. (2000); validação PT-BR Gurgel et al. (2012)
  // Auto-aplicação em adultos · 15 itens · 18 colunas no Sheet
  // Categoria: Risco & Sintomatologia Psicopatológica Geral
  // Privacidade: domínios/clusters NUNCA visíveis ao paciente.
  if (abaNome === 'MDQ') {
    return [
      hoje,
      d.patientCode || d.Codigo || d.codigo || d['Código'] || cod || '',
      d.nomeCrianca || d.NomeUtente || d.nomeUtente || nome || '',
      d.nome_informante || d.Respondente || d.respondente || d.NomeInformante || d.nomeInformante || '',
      d.Idade || d.idade || '',
      d.Sexo  || d.sexo  || '',
      d.Soma_P1 !== undefined && d.Soma_P1 !== null ? d.Soma_P1 : '',
      d.P2      !== undefined && d.P2      !== null ? d.P2      : '',
      d.P3      !== undefined && d.P3      !== null ? d.P3      : '',
      d.C1_Activacao    !== undefined && d.C1_Activacao    !== null ? d.C1_Activacao    : (d.C1 !== undefined ? d.C1 : ''),
      d.C2_Cognicao     !== undefined && d.C2_Cognicao     !== null ? d.C2_Cognicao     : (d.C2 !== undefined ? d.C2 : ''),
      d.C3_Expansividade !== undefined && d.C3_Expansividade !== null ? d.C3_Expansividade : (d.C3 !== undefined ? d.C3 : ''),
      d.C4_Comunicacao  !== undefined && d.C4_Comunicacao  !== null ? d.C4_Comunicacao  : (d.C4 !== undefined ? d.C4 : ''),
      d.C5_Irritabilidade !== undefined && d.C5_Irritabilidade !== null ? d.C5_Irritabilidade : (d.C5 !== undefined ? d.C5 : ''),
      d.C6_Risco        !== undefined && d.C6_Risco        !== null ? d.C6_Risco        : (d.C6 !== undefined ? d.C6 : ''),
      d.Classificacao || d['Classificação'] || d.classificacao || '',
      d.Alertas || d.alertas || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || [])
    ];
  }

  // ── AQ Buss-Perry — Questionário de Agressividade ─────────────
  // Buss & Perry (1992); Cunha & Gonçalves (2012, n=633)
  // Auto-aplicação em adultos · 29 itens · 4 subescalas + Total
  // Itens invertidos: 9 e 16 (6 − resposta).
  // Privacidade: scores e classificações NUNCA visíveis ao paciente.
  if (abaNome === 'AQ_BussPerry') {
    return [
      hoje,
      d.patientCode || d.Codigo || d.codigo || d['Código'] || cod || '',
      d.NomeAvaliado || d.nomeAvaliado || d.nomeCrianca || nome || '',
      d.Idade || d.idade || '',
      d.Sexo  || d.sexo  || '',
      d.NomeInformante || d.nomeInformante || d.nome_informante || '',
      d.AF_Bruto    !== undefined && d.AF_Bruto    !== null ? d.AF_Bruto    : '',
      d.AV_Bruto    !== undefined && d.AV_Bruto    !== null ? d.AV_Bruto    : '',
      d.IR_Bruto    !== undefined && d.IR_Bruto    !== null ? d.IR_Bruto    : '',
      d.HO_Bruto    !== undefined && d.HO_Bruto    !== null ? d.HO_Bruto    : '',
      d.TOTAL_Bruto !== undefined && d.TOTAL_Bruto !== null ? d.TOTAL_Bruto : '',
      d.AF_Classe    || '',
      d.AV_Classe    || '',
      d.IR_Classe    || '',
      d.HO_Classe    || '',
      d.TOTAL_Classe || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || [])
    ];
  }

  // ── ChEAT — Children's Eating Attitude Test ──────────────────
  // Maloney et al. (1988); versão portuguesa Barillari et al. (2011)
  // Auto-resposta criança 8–13 anos · 26 itens · 3 subescalas + Total
  // Itens invertidos: 19 e 25. Privacidade: scores NUNCA visíveis à criança.
  if (abaNome === 'ChEAT') {
    return [
      hoje,
      d.patientCode || d.Codigo || d.codigo || d['Código'] || cod || '',
      d.nomeCrianca || d.NomeCrianca || d['NomeCriança'] || d.childName || nome || '',
      d.Informante || d.informante || 'Criança (autoavaliação)',
      d.NomeInformante || d.nomeInformante || d.nome_informante || '',
      d.DataNasc || d.dataNasc || d.dob || '',
      d.AnoEscolar || d.anoEscolar || d.grade || '',
      d.Total            !== undefined && d.Total            !== null ? d.Total            : '',
      d.Dieta_Restricao  !== undefined && d.Dieta_Restricao  !== null ? d.Dieta_Restricao  : '',
      d.Preoc_Alimentar  !== undefined && d.Preoc_Alimentar  !== null ? d.Preoc_Alimentar  : '',
      d.Bulimia_Controlo !== undefined && d.Bulimia_Controlo !== null ? d.Bulimia_Controlo : '',
      d.Risco         || '',
      d.Interpretacao || d['Interpretação'] || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || d.answers || {})
    ];
  }

  // ── AQ-Child — Quociente de Espectro do Autismo (Versão Criança) ──
  // Auyeung, Baron-Cohen, Wheelwright & Allison (2008); tradução PT Coelho (2020)
  // Preenchimento por pais/cuidadores · crianças 4–11 anos · 50 itens · Likert 4 pontos
  // 24 itens directos + 26 itens reversos · 5 subescalas (10 itens cada): S, A, D, C, I
  // Total 0–150 · Cut-off clínico ≥ 76 (Sens. 95% · Espec. 95%)
  if (abaNome === 'AQ_Child') {
    return [
      hoje,
      d.patientCode || d.Codigo || d.codigo || d['Código'] || cod || '',
      d.nome_crianca || d.nomeCrianca || d.NomeCrianca || d['NomeCriança'] || d.childName || nome || '',
      d.dob || d.DataNasc || d.dataNasc || d.dataNascimento || '',
      d.sexo || d.Sexo || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.relacao || d['Relação'] || d.Relacao || d.informante || d.Informante || '',
      d.S !== undefined && d.S !== null ? d.S : '',
      d.A !== undefined && d.A !== null ? d.A : '',
      d.D !== undefined && d.D !== null ? d.D : '',
      d.C !== undefined && d.C !== null ? d.C : '',
      d.I !== undefined && d.I !== null ? d.I : '',
      d.total !== undefined && d.total !== null ? d.total : (d.Total !== undefined ? d.Total : ''),
      d.classificacao || d.Classificacao || d['Classificação'] || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || d.answers || {})
    ];
  }


  // ── ISS-I / ESI — Inventário de Sintomas de Stress Infantil ──
  // Lucarelli & Lipp (1998) · adaptação técnica PT-PT · 6-14 anos
  // Versão Criança (autorrelato) · 4 domínios + TOTAL · 4 itens sentinela
  if (abaNome === 'ISS_ESI') {
    return [
      hoje,
      d.patientCode || d.codigo || d['Código'] || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || d.nome || nome || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.informante || d.Informante || 'Criança (autorrelato)',
      d.dataNasc || d.DataNasc || d.dob || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.anoEscolar || d.AnoEscolar || d.ano_escolar || '',
      d.faixa || d.Faixa || '',
      d.F_Soma  !== undefined && d.F_Soma  !== null ? d.F_Soma  : '',
      d.F_Pct   !== undefined && d.F_Pct   !== null ? d.F_Pct   : '',
      d.F_Banda || '',
      d.P_Soma  !== undefined && d.P_Soma  !== null ? d.P_Soma  : '',
      d.P_Pct   !== undefined && d.P_Pct   !== null ? d.P_Pct   : '',
      d.P_Banda || '',
      d.D_Soma  !== undefined && d.D_Soma  !== null ? d.D_Soma  : '',
      d.D_Pct   !== undefined && d.D_Pct   !== null ? d.D_Pct   : '',
      d.D_Banda || '',
      d.PF_Soma !== undefined && d.PF_Soma !== null ? d.PF_Soma : '',
      d.PF_Pct  !== undefined && d.PF_Pct  !== null ? d.PF_Pct  : '',
      d.PF_Banda || '',
      d.TOTAL_Soma  !== undefined && d.TOTAL_Soma  !== null ? d.TOTAL_Soma  : '',
      d.TOTAL_Pct   !== undefined && d.TOTAL_Pct   !== null ? d.TOTAL_Pct   : '',
      d.TOTAL_Banda || '',
      d.Sentinelas_Activas || d.sentinelas_activas || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || d.answers || [])
    ];
  }


  // ── C-SSRS-P — Risco Suicidário · Versão Pediátrica · v69.0 ──
  // Ricardina Correia (2026) · 6-11 anos · Auto + Hetero
  // Inclui Tipo (Autoavaliação/Heteroavaliação) e Convivencia/FreqContacto (hetero)
  if (abaNome === 'C_SSRS_P') {
    return [
      hoje,
      d.patientCode || d.codigo || d['Código'] || cod || '',
      d.tipo || d.Tipo || '',
      d.nomeCrianca || d.nome_crianca || d['NomeCriança'] || d.NomeCrianca || d.nome || nome || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.dataAplicacao || d.DataAplicacao || d.data_aplicacao || '',
      d.avaliador || d.Avaliador || '',
      d.contexto || d.Contexto || '',
      d.diagnostico || d.Diagnostico || d['Diagnóstico'] || '',
      d.observacoes || d.Observacoes || d['Observações'] || '',
      d.nomeInformante || d.nome_informante || d.NomeInformante || '',
      d.relacao || d.Relacao || d['Relação'] || '',
      d.convivencia || d.Convivencia || '',
      d.freqContacto || d.FreqContacto || d.freq_contacto || '',
      d.nivelA_V !== undefined && d.nivelA_V !== null ? d.nivelA_V : (d.NivelA_V !== undefined ? d.NivelA_V : 0),
      d.nivelA_3 !== undefined && d.nivelA_3 !== null ? d.nivelA_3 : (d.NivelA_3 !== undefined ? d.NivelA_3 : 0),
      d.intensB_V !== undefined && d.intensB_V !== null ? d.intensB_V : (d.IntensB_V !== undefined ? d.IntensB_V : 0),
      d.intensB_3 !== undefined && d.intensB_3 !== null ? d.intensB_3 : (d.IntensB_3 !== undefined ? d.IntensB_3 : 0),
      d.comp_V !== undefined && d.comp_V !== null ? d.comp_V : (d.Comp_V !== undefined ? d.Comp_V : 0),
      d.comp_3 !== undefined && d.comp_3 !== null ? d.comp_3 : (d.Comp_3 !== undefined ? d.Comp_3 : 0),
      d.ans_V !== undefined && d.ans_V !== null ? d.ans_V : (d.ANS_V !== undefined ? d.ANS_V : 0),
      d.ans_3 !== undefined && d.ans_3 !== null ? d.ans_3 : (d.ANS_3 !== undefined ? d.ANS_3 : 0),
      d.letMax_V !== undefined && d.letMax_V !== null ? d.letMax_V : (d.LetMax_V !== undefined ? d.LetMax_V : 0),
      d.letMax_3 !== undefined && d.letMax_3 !== null ? d.letMax_3 : (d.LetMax_3 !== undefined ? d.LetMax_3 : 0),
      d.class_V || d.Class_V || d.classificacao_V || '',
      d.class_3 || d.Class_3 || d.classificacao_3 || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }


  // ── C-SSRS-A — Risco Suicidário · Versão Adolescente · v69.0 ──
  // Ricardina Correia (2026) · 12-18 anos · Só Auto (sem hetero)
  // SEM Convivencia/FreqContacto (apenas autoavaliação)
  if (abaNome === 'C_SSRS_A') {
    return [
      hoje,
      d.patientCode || d.codigo || d['Código'] || cod || '',
      d.tipo || d.Tipo || 'Autoavaliação',
      d.nomeAdolescente || d.nome_adolescente || d.NomeAdolescente ||
        d.nomeCrianca || d.nome_crianca || d['NomeCriança'] || d.nome || nome || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.dataAplicacao || d.DataAplicacao || d.data_aplicacao || '',
      d.avaliador || d.Avaliador || '',
      d.contexto || d.Contexto || '',
      d.diagnostico || d.Diagnostico || d['Diagnóstico'] || '',
      d.observacoes || d.Observacoes || d['Observações'] || '',
      d.nomeInformante || d.nome_informante || d.NomeInformante || '',
      d.relacao || d.Relacao || d['Relação'] || 'Próprio',
      d.nivelA_V !== undefined && d.nivelA_V !== null ? d.nivelA_V : (d.NivelA_V !== undefined ? d.NivelA_V : 0),
      d.nivelA_3 !== undefined && d.nivelA_3 !== null ? d.nivelA_3 : (d.NivelA_3 !== undefined ? d.NivelA_3 : 0),
      d.intensB_V !== undefined && d.intensB_V !== null ? d.intensB_V : (d.IntensB_V !== undefined ? d.IntensB_V : 0),
      d.intensB_3 !== undefined && d.intensB_3 !== null ? d.intensB_3 : (d.IntensB_3 !== undefined ? d.IntensB_3 : 0),
      d.comp_V !== undefined && d.comp_V !== null ? d.comp_V : (d.Comp_V !== undefined ? d.Comp_V : 0),
      d.comp_3 !== undefined && d.comp_3 !== null ? d.comp_3 : (d.Comp_3 !== undefined ? d.Comp_3 : 0),
      d.ans_V !== undefined && d.ans_V !== null ? d.ans_V : (d.ANS_V !== undefined ? d.ANS_V : 0),
      d.ans_3 !== undefined && d.ans_3 !== null ? d.ans_3 : (d.ANS_3 !== undefined ? d.ANS_3 : 0),
      d.letMax_V !== undefined && d.letMax_V !== null ? d.letMax_V : (d.LetMax_V !== undefined ? d.LetMax_V : 0),
      d.letMax_3 !== undefined && d.letMax_3 !== null ? d.letMax_3 : (d.LetMax_3 !== undefined ? d.LetMax_3 : 0),
      d.class_V || d.Class_V || d.classificacao_V || '',
      d.class_3 || d.Class_3 || d.classificacao_3 || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }


  // ── C-SSRS-DC — Risco Suicidário · Versão Défice Cognitivo · v69.0 ──
  // Ricardina Correia (2026) · qualquer idade · Auto + Hetero
  // Bloco A inclui opção "Não compreende"; Bloco B reduzido a 3 itens (soma 0-6)
  // Schema idêntico ao C_SSRS_P (a NC fica codificada no JSON Respostas)
  if (abaNome === 'C_SSRS_DC') {
    return [
      hoje,
      d.patientCode || d.codigo || d['Código'] || cod || '',
      d.tipo || d.Tipo || '',
      d.nomeCrianca || d.nome_crianca || d['NomeCriança'] || d.NomeCrianca || d.nome || nome || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.dataAplicacao || d.DataAplicacao || d.data_aplicacao || '',
      d.avaliador || d.Avaliador || '',
      d.contexto || d.Contexto || '',
      d.diagnostico || d.Diagnostico || d['Diagnóstico'] || '',
      d.observacoes || d.Observacoes || d['Observações'] || '',
      d.nomeInformante || d.nome_informante || d.NomeInformante || '',
      d.relacao || d.Relacao || d['Relação'] || '',
      d.convivencia || d.Convivencia || '',
      d.freqContacto || d.FreqContacto || d.freq_contacto || '',
      d.nivelA_V !== undefined && d.nivelA_V !== null ? d.nivelA_V : (d.NivelA_V !== undefined ? d.NivelA_V : 0),
      d.nivelA_3 !== undefined && d.nivelA_3 !== null ? d.nivelA_3 : (d.NivelA_3 !== undefined ? d.NivelA_3 : 0),
      d.intensB_V !== undefined && d.intensB_V !== null ? d.intensB_V : (d.IntensB_V !== undefined ? d.IntensB_V : 0),
      d.intensB_3 !== undefined && d.intensB_3 !== null ? d.intensB_3 : (d.IntensB_3 !== undefined ? d.IntensB_3 : 0),
      d.comp_V !== undefined && d.comp_V !== null ? d.comp_V : (d.Comp_V !== undefined ? d.Comp_V : 0),
      d.comp_3 !== undefined && d.comp_3 !== null ? d.comp_3 : (d.Comp_3 !== undefined ? d.Comp_3 : 0),
      d.ans_V !== undefined && d.ans_V !== null ? d.ans_V : (d.ANS_V !== undefined ? d.ANS_V : 0),
      d.ans_3 !== undefined && d.ans_3 !== null ? d.ans_3 : (d.ANS_3 !== undefined ? d.ANS_3 : 0),
      d.letMax_V !== undefined && d.letMax_V !== null ? d.letMax_V : (d.LetMax_V !== undefined ? d.LetMax_V : 0),
      d.letMax_3 !== undefined && d.letMax_3 !== null ? d.letMax_3 : (d.LetMax_3 !== undefined ? d.LetMax_3 : 0),
      d.class_V || d.Class_V || d.classificacao_V || '',
      d.class_3 || d.Class_3 || d.classificacao_3 || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }


  // ── M-CHAT-R/F — Despiste Precoce de Autismo · v69.0 ──
  // © 2009 Robins, Fein, & Barton · Tradução PT-PT: Carla Cintrão Almeida
  // 16-30 meses · pais preenchem etapa 1 (20 itens Sim/Não)
  // Etapa 2 condicional (entrevista de seguimento item-a-item) se score 3-7
  // 4 categorias finais: Baixo · Moderado — Negativo · Moderado — Positivo · Alto
  if (abaNome === 'M_CHAT_R_F') {
    return [
      hoje,
      d.patientCode || d.codigo || d.Codigo || d['Código'] || cod || '',
      d.nomeCrianca || d.nome_crianca || d.NomeCrianca || d['NomeCriança'] || d.nome || nome || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.dataAplicacao || d.DataAplicacao || d.data_aplicacao || '',
      d.avaliador || d.Avaliador || '',
      d.contexto || d.Contexto || '',
      d.observacoes || d.Observacoes || d['Observações'] || '',
      d.nomeInformante || d.nome_informante || d.NomeInformante || '',
      d.relacao || d.Relacao || d['Relação'] || '',
      d.scoreE1 !== undefined && d.scoreE1 !== null ? d.scoreE1 : (d.ScoreE1 !== undefined ? d.ScoreE1 : 0),
      (d.scoreE2 === '' || d.scoreE2 === null || d.scoreE2 === undefined)
        ? (d.ScoreE2 === undefined || d.ScoreE2 === null || d.ScoreE2 === '' ? '' : d.ScoreE2)
        : d.scoreE2,
      d.catFinal || d.CatFinal || '',
      d.etapa2Admin || d.Etapa2Admin || d.etapa2_admin || '',
      d.itensFalhadosE1 || d.ItensFalhadosE1 || d.itens_falhados || '',
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── CARS2-HP (EARI-AF) · v70.0 ───────────────────────────────
  if (abaNome === 'CARS2_HP') {
    var dHP = function(i) {
      var v = d['D' + i];
      if (v === undefined || v === null || v === '') return '';
      return v;
    };
    return [
      hoje,
      d.patientCode || d.codigo || d.Codigo || d['Código'] || cod || '',
      d.nomeAvaliando || d.nome_avaliando || d.NomeAvaliando || d.nomeCrianca || d['Nome Criança'] || d.nome || nome || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.dataAplicacao || d.DataAplicacao || d.data_aplicacao || '',
      d.psicologo || d.Psicologo || d.avaliador || '',
      d.contexto || d.Contexto || '',
      d.fontes || d.Fontes || '',
      dHP(1), dHP(2), dHP(3), dHP(4), dHP(5), dHP(6), dHP(7), dHP(8),
      dHP(9), dHP(10), dHP(11), dHP(12), dHP(13), dHP(14), dHP(15),
      d.Total !== undefined && d.Total !== null ? d.Total : (d.total !== undefined ? d.total : ''),
      d.Categoria || d.categoria || '',
      d.DominiosCriticos || d.dominiosCriticos || d.dominios_criticos || '',
      d.NCriticos !== undefined && d.NCriticos !== null ? d.NCriticos : (d.nCriticos !== undefined ? d.nCriticos : ''),
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── CARS2-QPC (EARI-QP) · v70.0 ──────────────────────────────
  if (abaNome === 'CARS2_QPC') {
    var pct = function(i) {
      var v = d['pct_dom_' + i];
      if (v === undefined || v === null || v === '') return '';
      return v;
    };
    var sin = function(i) {
      var v = d['sinal_dom_' + i];
      if (v === undefined || v === null || v === '') return '';
      return v;
    };
    return [
      hoje,
      d.patientCode || d.codigo || d.Codigo || d['Código'] || cod || '',
      d.nomeAvaliando || d.nome_avaliando || d.NomeAvaliando || d.nomeCrianca || d['Nome Criança'] || d.nome || nome || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.dataAplicacao || d.DataAplicacao || d.data_aplicacao || '',
      d.nomeInformante || d.nome_informante || d.NomeInformante || '',
      d.relacao || d.Relacao || d['Relação'] || '',
      d.tempoConvivencia || d.tempo_convivencia || d.TempoConvivencia || '',
      d.outrasPessoas || d.outras_pessoas || d.OutrasPessoas || '',
      d.psicologo || d.Psicologo || '',
      d.contexto || d.Contexto || '',
      d.nItensRespondidos !== undefined && d.nItensRespondidos !== null ? d.nItensRespondidos : (d.NItensRespondidos !== undefined ? d.NItensRespondidos : ''),
      d.nItensPreocupantes !== undefined && d.nItensPreocupantes !== null ? d.nItensPreocupantes : (d.NItensPreocupantes !== undefined ? d.NItensPreocupantes : ''),
      d.pctGlobal !== undefined && d.pctGlobal !== null ? d.pctGlobal : (d.PctGlobal !== undefined ? d.PctGlobal : ''),
      d.nDominiosSinalizados !== undefined && d.nDominiosSinalizados !== null ? d.nDominiosSinalizados : (d.NDominiosSinalizados !== undefined ? d.NDominiosSinalizados : ''),
      d.DominiosSinalizados || d.dominiosSinalizados || d.dominios_sinalizados || '',
      d.Categoria || d.categoria || '',
      pct(1), pct(2), pct(3), pct(4), pct(5),
      pct(6), pct(7), pct(8), pct(9), pct(10),
      pct(11), pct(12), pct(13), pct(14), pct(15),
      sin(1), sin(2), sin(3), sin(4), sin(5),
      sin(6), sin(7), sin(8), sin(9), sin(10),
      sin(11), sin(12), sin(13), sin(14), sin(15),
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── CARS2-ST (EARI-AS) · v70.0 ───────────────────────────────
  if (abaNome === 'CARS2_ST') {
    var dST = function(i) {
      var v = d['D' + i];
      if (v === undefined || v === null || v === '') return '';
      return v;
    };
    return [
      hoje,
      d.patientCode || d.codigo || d.Codigo || d['Código'] || cod || '',
      d.nomeAvaliando || d.nome_avaliando || d.NomeAvaliando || d.nomeCrianca || d['Nome Criança'] || d.nome || nome || '',
      d.dob || d.DataNasc || d.dataNasc || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.dataAplicacao || d.DataAplicacao || d.data_aplicacao || '',
      d.qiEstimado || d.qi_estimado || d.QIEstimado || '',
      d.nivelVerbal || d.nivel_verbal || d.NivelVerbal || '',
      d.psicologo || d.Psicologo || d.avaliador || '',
      d.contexto || d.Contexto || '',
      d.fontes || d.Fontes || '',
      dST(1), dST(2), dST(3), dST(4), dST(5), dST(6), dST(7), dST(8),
      dST(9), dST(10), dST(11), dST(12), dST(13), dST(14), dST(15),
      d.Total !== undefined && d.Total !== null ? d.Total : (d.total !== undefined ? d.total : ''),
      d.Categoria || d.categoria || '',
      d.DominiosCriticos || d.dominiosCriticos || d.dominios_criticos || '',
      d.NCriticos !== undefined && d.NCriticos !== null ? d.NCriticos : (d.nCriticos !== undefined ? d.nCriticos : ''),
      typeof d.Respostas === 'string' ? d.Respostas : JSON.stringify(d.Respostas || d.respostas || {})
    ];
  }

  // ── MCP · Mapeamento de Configuração Parental (Ricardina Correia, 2026) ───
  // Aceita 2 formatos de payload, com fallbacks defensivos:
  //   (a) achatado: d.s3_1, d.s2_escola, d.media_autoridade, d.nomeInformante…
  //   (b) aninhado nativo do MCP: d.id.{patientCode,nomeCrianca,…}, d.s1.coabitantes,
  //                                d.s2.escola, d.s3.itens.s3_1, d.s4.itens.s4_1 (Breve),
  //                                d.s5.itens.s5_1, d.s6.itens.s6_1, d.s4.figuras, etc.
  // Se as médias não vierem calculadas, são reconstruídas aqui com a fórmula do questionário
  // (Likert 1-5; inversão = 6 - v; calcMediaParcial para Acomodação S5 itens 1-3).
  if (abaNome === 'MCP_Breve' || abaNome === 'MCP_Completo') {

    // -- helpers locais (encapsulados para não colidir com outros ramos) --
    function _id(d) { return (d && d.id && typeof d.id === 'object') ? d.id : {}; }
    function _sec(d, secKey) { return (d && d[secKey] && typeof d[secKey] === 'object') ? d[secKey] : {}; }
    function _itens(d, secKey) {
      var s = _sec(d, secKey);
      return (s && s.itens && typeof s.itens === 'object') ? s.itens : {};
    }
    function _firstNonEmpty() {
      for (var i = 0; i < arguments.length; i++) {
        var v = arguments[i];
        if (v !== undefined && v !== null && v !== '') return v;
      }
      return '';
    }
    function _jsonField(v) {
      if (v === undefined || v === null) return '';
      if (typeof v === 'string') return v;
      try { return JSON.stringify(v); } catch (e) { return ''; }
    }
    function _toNum(v) {
      if (v === undefined || v === null || v === '') return null;
      var n = (typeof v === 'number') ? v : parseFloat(v);
      return isNaN(n) ? null : n;
    }
    // calcMedia com inversão: para escala 1-5, ajustado = 6 - v
    function _calcMedia(obj, invIds) {
      if (!obj) return null;
      invIds = invIds || [];
      var soma = 0, n = 0;
      Object.keys(obj).forEach(function(k) {
        var v = _toNum(obj[k]);
        if (v == null) return;
        var ajustado = (invIds.indexOf(k) >= 0) ? (6 - v) : v;
        soma += ajustado; n++;
      });
      return n ? (soma / n) : null;
    }
    function _calcMediaParcial(obj, ids) {
      if (!obj) return null;
      var soma = 0, n = 0;
      ids.forEach(function(k) {
        var v = _toNum(obj[k]);
        if (v == null) return;
        soma += v; n++;
      });
      return n ? (soma / n) : null;
    }
    function _fmt(v) { return (v == null) ? '' : Number(v.toFixed(4)); }

    var ident = _id(d);
    var s1 = _sec(d, 's1');
    var s2 = _sec(d, 's2');
    var s3i = _itens(d, 's3');
    var s4_breve = _itens(d, 's4');     // só relevante para MCP Breve (S4 = posição parental)
    var s5i = _itens(d, 's5');
    var s6i = _itens(d, 's6');

    // Identificação (achatado OU aninhado em d.id)
    var patientCode    = _firstNonEmpty(d.patientCode, d.codigo, d.Código, d['Código'], ident.patientCode, cod);
    var nomeCrianca    = _firstNonEmpty(d.nomeCrianca, d.NomeCrianca, d.childName, d.nome, ident.nomeCrianca, nome);
    var nomeInformante = _firstNonEmpty(d.nomeInformante, d.NomeInformante, d.nome_informante, d.nome_preenche, ident.nomeInformante);
    var relacao        = _firstNonEmpty(d.relacao, d.Relacao, d['Relação'], ident.relacao);
    var configTipo     = _firstNonEmpty(d.configTipo, d.ConfigTipo, d.config_tipo, ident.configTipo);
    var tempoCoabita   = _firstNonEmpty(d.tempoCoabitacao, d.TempoCoabitacao, d.tempo_coabitacao, ident.tempoCoabitacao);

    // S1: coabitantes (JSON) + inicio (+ inicioOutra/futuro só no Completo)
    var coabitantes    = _firstNonEmpty(d.coabitantes, d.Coabitantes, s1.coabitantes);
    var inicio         = _firstNonEmpty(d.inicio, d.Inicio, s1.inicio);
    var inicioOutra    = _firstNonEmpty(d.inicioOutra, d.InicioOutra, d.inicio_outra, s1.inicioOutra);
    var futuro         = _firstNonEmpty(d.futuro, d.Futuro, s1.futuro);

    // S2: 6 situações quotidianas (achatado ou aninhado em d.s2.{escola,refeicoes,…})
    function _s2(key, flat) {
      return _firstNonEmpty(d[flat], d['S2_' + key], d['s2_' + key.toLowerCase()], s2[key.toLowerCase()], s2[key]);
    }
    var s2_escola         = _s2('escola',         's2_escola');
    var s2_refeicoes      = _s2('refeicoes',      's2_refeicoes');
    var s2_banho          = _s2('banho',          's2_banho');
    var s2_adormecimento  = _s2('adormecimento',  's2_adormecimento');
    var s2_noite          = _s2('noite',          's2_noite');
    var s2_doenca         = _s2('doenca',         's2_doenca');

    // S3: 6 itens autoridade educativa (Likert 1-5; inversão em 3,4,5)
    function _q(itensObj, sec, n) {
      var keyA = sec + '_' + n;            // 's3_1'
      var keyB = 'S' + n;                  // 'S1' (improvável mas defensivo)
      var keyC = (sec.toUpperCase()) + '_' + n; // 'S3_1'
      return _firstNonEmpty(d[keyA], d[keyC], itensObj[keyA], itensObj[keyB]);
    }
    var s3_1 = _q(s3i, 's3', 1), s3_2 = _q(s3i, 's3', 2), s3_3 = _q(s3i, 's3', 3);
    var s3_4 = _q(s3i, 's3', 4), s3_5 = _q(s3i, 's3', 5), s3_6 = _q(s3i, 's3', 6);

    // Recompor objeto S3 numérico (sem strings vazias) para cálculo da média
    function _itensNum(pairs) {
      var out = {};
      pairs.forEach(function(p) {
        var v = _toNum(p[1]);
        if (v != null) out[p[0]] = v;
      });
      return out;
    }
    var s3obj = _itensNum([['s3_1',s3_1],['s3_2',s3_2],['s3_3',s3_3],['s3_4',s3_4],['s3_5',s3_5],['s3_6',s3_6]]);
    var mediaAutoridade = _toNum(
      _firstNonEmpty(d.media_autoridade, d.Media_Autoridade, d.mediaAutoridade, d.m_aut)
    );
    if (mediaAutoridade == null) mediaAutoridade = _calcMedia(s3obj, ['s3_3','s3_4','s3_5']);

    if (abaNome === 'MCP_Breve') {
      // S4 do Breve = posição parental do informante (4 itens, inversão em 3 e 4)
      var s4_1 = _q(s4_breve, 's4', 1), s4_2 = _q(s4_breve, 's4', 2);
      var s4_3 = _q(s4_breve, 's4', 3), s4_4 = _q(s4_breve, 's4', 4);
      var s4obj = _itensNum([['s4_1',s4_1],['s4_2',s4_2],['s4_3',s4_3],['s4_4',s4_4]]);
      var mediaBemEstarBreve = _toNum(
        _firstNonEmpty(d.media_bemestar, d.Media_BemEstar, d.mediaBemEstar, d.m_be)
      );
      if (mediaBemEstarBreve == null) mediaBemEstarBreve = _calcMedia(s4obj, ['s4_3','s4_4']);

      return [
        hoje,
        patientCode,
        nomeCrianca,
        nomeInformante,
        relacao,
        configTipo,
        tempoCoabita,
        _jsonField(coabitantes),
        inicio,
        s2_escola, s2_refeicoes, s2_banho, s2_adormecimento, s2_noite, s2_doenca,
        s3_1, s3_2, s3_3, s3_4, s3_5, s3_6,
        s4_1, s4_2, s4_3, s4_4,
        _fmt(mediaAutoridade),
        _fmt(mediaBemEstarBreve),
        _jsonField(d.Respostas || d.respostas || d)
      ];
    }

    // MCP_Completo
    // S4 do Completo = relação afetiva por figura (objeto dinâmico) + 2 perguntas qualitativas
    var s4completoSec = _sec(d, 's4');
    var s4_figuras    = _firstNonEmpty(d.s4_figuras, d.S4_Figuras, d.figuras, s4completoSec.figuras);
    var s4_procuraMedo  = _firstNonEmpty(d.s4_procuraMedo, d.S4_ProcuraMedo, d.procuraMedo, d.procura_medo, s4completoSec.procuraMedo);
    var s4_procuraZanga = _firstNonEmpty(d.s4_procuraZanga, d.S4_ProcuraZanga, d.procuraZanga, d.procura_zanga, s4completoSec.procuraZanga);

    // S3 aberta (Completo)
    var s3_aberta = _firstNonEmpty(d.s3_aberta, d.S3_Aberta, _sec(d, 's3').aberta);

    // S5: 5 itens · resposta dos outros / acomodação (sem inversão na média de acomodação)
    var s5_1 = _q(s5i, 's5', 1), s5_2 = _q(s5i, 's5', 2);
    var s5_3 = _q(s5i, 's5', 3), s5_4 = _q(s5i, 's5', 4), s5_5 = _q(s5i, 's5', 5);
    var s5obj = _itensNum([['s5_1',s5_1],['s5_2',s5_2],['s5_3',s5_3],['s5_4',s5_4],['s5_5',s5_5]]);
    var mediaAcomodacao = _toNum(
      _firstNonEmpty(d.media_acomodacao, d.Media_Acomodacao, d.mediaAcomodacao, d.m_acom)
    );
    // calcMediaParcial(s5, ['s5_1','s5_2','s5_3']) — itens 4 e 5 são fenómenos contrários, ficam fora
    if (mediaAcomodacao == null) mediaAcomodacao = _calcMediaParcial(s5obj, ['s5_1','s5_2','s5_3']);

    // S6: 4 itens posição parental do informante (inversão em 3 e 4) + aberta
    var s6_1 = _q(s6i, 's6', 1), s6_2 = _q(s6i, 's6', 2);
    var s6_3 = _q(s6i, 's6', 3), s6_4 = _q(s6i, 's6', 4);
    var s6_aberta = _firstNonEmpty(d.s6_aberta, d.S6_Aberta, _sec(d, 's6').aberta);
    var s6obj = _itensNum([['s6_1',s6_1],['s6_2',s6_2],['s6_3',s6_3],['s6_4',s6_4]]);
    var mediaBemEstar = _toNum(
      _firstNonEmpty(d.media_bemestar, d.Media_BemEstar, d.mediaBemEstar, d.m_be)
    );
    if (mediaBemEstar == null) mediaBemEstar = _calcMedia(s6obj, ['s6_3','s6_4']);

    // S7: síntese clínica aberta (2 perguntas)
    var s7sec      = _sec(d, 's7');
    var s7_funciona = _firstNonEmpty(d.s7_funciona, d.S7_Funciona, s7sec.funciona);
    var s7_mudar    = _firstNonEmpty(d.s7_mudar,    d.S7_Mudar,    s7sec.mudar);

    return [
      hoje,
      patientCode,
      nomeCrianca,
      nomeInformante,
      relacao,
      configTipo,
      tempoCoabita,
      _jsonField(coabitantes),
      inicio,
      inicioOutra,
      futuro,
      s2_escola, s2_refeicoes, s2_banho, s2_adormecimento, s2_noite, s2_doenca,
      s3_1, s3_2, s3_3, s3_4, s3_5, s3_6, s3_aberta,
      _jsonField(s4_figuras), s4_procuraMedo, s4_procuraZanga,
      s5_1, s5_2, s5_3, s5_4, s5_5,
      s6_1, s6_2, s6_3, s6_4, s6_aberta,
      s7_funciona, s7_mudar,
      _fmt(mediaAutoridade),
      _fmt(mediaAcomodacao),
      _fmt(mediaBemEstar),
      _jsonField(d.Respostas || d.respostas || d)
    ];
  }

  // ══════════════════════════════════════════════════════════════
  // UCLA-PTSD Adaptado · Rastreio PSPT Pediátrica (Ricardina Correia, 2026)
  // ══════════════════════════════════════════════════════════════
  // Clinician-rated · 7-11 anos · adaptação inspirada (Via B) do DSM-5-TR
  // 13 eventos (Critério A) + Evento Índice + 27 itens Likert 0-4 + duração/início
  // Aceita 2 formatos de payload, com fallbacks defensivos:
  //   (a) achatado: d.B1, d.D3, d.totalSintomatico, d.padraoTag…  (formato nativo do HTML)
  //   (b) aninhado: d.itens.B1, d.scores.totalSintomatico, d.scores.padrao.tag, d.eventos[]…
  // Se os scores não vierem calculados, são reconstruídos aqui com a mesma lógica do HTML
  // (Total = B+C+D+E, banda 0-19/20-34/35-49/50-80, regra A+B+C+D+E+F+G, padrão T1-T5)
  if (abaNome === 'UCLA_PTSD_Adaptado') {

    // -- helpers locais (encapsulados — não colidem com o ramo MCP) --
    function _u_firstNonEmpty() {
      for (var i = 0; i < arguments.length; i++) {
        var v = arguments[i];
        if (v !== undefined && v !== null && v !== '') return v;
      }
      return '';
    }
    function _u_toNum(v) {
      if (v === undefined || v === null || v === '') return 0;
      var n = (typeof v === 'number') ? v : parseFloat(v);
      return isNaN(n) ? 0 : n;
    }
    function _u_jsonField(v) {
      if (v === undefined || v === null) return '';
      if (typeof v === 'string') return v;
      try { return JSON.stringify(v); } catch (e) { return ''; }
    }
    function _u_flag(b, hard) {
      // Aceita boolean directo, 'SIM'/'NÃO', 1/0, 'true'/'false'
      if (b === true) return 'SIM';
      if (b === false) return 'NÃO';
      if (b === undefined || b === null || b === '') return hard ? 'NÃO' : '';
      var s = String(b).toUpperCase().trim();
      if (s === 'SIM' || s === 'YES' || s === '1' || s === 'TRUE' || s === 'POSITIVO') return 'SIM';
      if (s === 'NÃO' || s === 'NAO' || s === 'NO' || s === '0' || s === 'FALSE' || s === 'NEGATIVO') return 'NÃO';
      return hard ? 'NÃO' : '';
    }

    // -- Identificação --
    var u_patientCode = _u_firstNonEmpty(d.patientCode, d.codigo, d.Código, d['Código'], cod);
    var u_nomeCrianca = _u_firstNonEmpty(d.nomeCrianca, d.NomeCrianca, d['NomeCriança'], d.nome_crianca, d.childName, nome);
    var u_idade       = _u_firstNonEmpty(d.idade, d.Idade, d.age);
    var u_sexo        = _u_firstNonEmpty(d.sexo, d.Sexo, d.sex, d.gender);
    var u_dataApl     = _u_firstNonEmpty(d.DataAplicacao, d.dataAplicacao, d.data_aplicacao, d.dataAvaliacao);
    var u_avaliador   = _u_firstNonEmpty(d.Avaliador, d.avaliador, d.nome_informante, d.NomeInformante, d.nomeInformante, d.psicologo);
    var u_nomeInform  = _u_firstNonEmpty(d.NomeInformante, d.nome_informante, d.nomeInformante, d.Avaliador, d.avaliador);
    var u_informante  = _u_firstNonEmpty(d.Informante, d.informante, 'Aplicador clínico');
    var u_contexto    = _u_firstNonEmpty(d.Contexto, d.contexto);

    // -- Critério A: eventos marcados + idades --
    // Aceita d.eventos (array de {id, marcado, idade}) ou d.EventosMarcados (string CSV)
    var u_nEventos = 0, u_evMarcados = '', u_evIdades = '';
    if (Array.isArray(d.eventos)) {
      var _ms = d.eventos.filter(function(e){ return e && e.marcado === true; });
      u_nEventos    = _ms.length;
      u_evMarcados  = _ms.map(function(e){ return e.id; }).join(',');
      u_evIdades    = _ms.map(function(e){ return e.id + ':' + (e.idade || '?'); }).join(',');
    } else {
      u_nEventos    = _u_toNum(d.NEventos || d.nEventos || 0);
      u_evMarcados  = _u_firstNonEmpty(d.EventosMarcados, d.eventosMarcados, '');
      u_evIdades    = _u_firstNonEmpty(d.EventosIdades, d.eventosIdades, '');
    }

    // -- Evento Índice --
    var _idx = (d.indice && typeof d.indice === 'object') ? d.indice : {};
    var u_indTipo       = _u_firstNonEmpty(d.IndiceTipo, d.indiceTipo, _idx.tipo);
    var u_indIdade      = _u_firstNonEmpty(d.IndiceIdade, d.indiceIdade, _idx.idade);
    var u_indModalidade = _u_firstNonEmpty(d.IndiceModalidade, d.indiceModalidade, _idx.modalidade);
    var u_indDescricao  = _u_firstNonEmpty(d.IndiceDescricao, d.indiceDescricao, _idx.descricao);

    // -- Itens Likert (aceita achatado d.B1 ou aninhado d.itens.B1) --
    var _it = (d.itens && typeof d.itens === 'object') ? d.itens : {};
    function _u_item(id) {
      return _u_firstNonEmpty(d[id], _it[id]);
    }
    var u_B1 = _u_item('B1'), u_B2 = _u_item('B2'), u_B3 = _u_item('B3'), u_B4 = _u_item('B4'), u_B5 = _u_item('B5');
    var u_C1 = _u_item('C1'), u_C2 = _u_item('C2');
    var u_D1 = _u_item('D1'), u_D2 = _u_item('D2'), u_D3 = _u_item('D3'), u_D4 = _u_item('D4');
    var u_D5 = _u_item('D5'), u_D6 = _u_item('D6'), u_D7 = _u_item('D7');
    var u_E1 = _u_item('E1'), u_E2 = _u_item('E2'), u_E3 = _u_item('E3');
    var u_E4 = _u_item('E4'), u_E5 = _u_item('E5'), u_E6 = _u_item('E6');
    var u_Dis1 = _u_item('Dis1'), u_Dis2 = _u_item('Dis2');
    var u_I1 = _u_item('I1'), u_I2 = _u_item('I2'), u_I3 = _u_item('I3'), u_I4 = _u_item('I4'), u_I5 = _u_item('I5');

    // -- Duração e Início --
    var u_dur = _u_firstNonEmpty(d.DuracaoMeses, d.duracaoMeses, d.duracao);
    var u_ini = _u_firstNonEmpty(d.InicioMeses, d.inicioMeses, d.inicio);

    // -- Scores (calcular se não vierem) --
    var _sc = (d.scores && typeof d.scores === 'object') ? d.scores : {};
    function _u_arr() { return Array.prototype.slice.call(arguments).map(_u_toNum); }
    function _u_soma(arr) { return arr.reduce(function(a,b){ return a + b; }, 0); }
    function _u_count2(arr) { return arr.filter(function(v){ return v >= 2; }).length; }

    var bArr = _u_arr(u_B1, u_B2, u_B3, u_B4, u_B5);
    var cArr = _u_arr(u_C1, u_C2);
    var dArr = _u_arr(u_D1, u_D2, u_D3, u_D4, u_D5, u_D6, u_D7);
    var eArr = _u_arr(u_E1, u_E2, u_E3, u_E4, u_E5, u_E6);
    var disArr = _u_arr(u_Dis1, u_Dis2);
    var iArr = _u_arr(u_I1, u_I2, u_I3, u_I4, u_I5);

    var u_totB = _u_firstNonEmpty(d.Tot_B, _sc.totB) !== '' ? _u_toNum(_u_firstNonEmpty(d.Tot_B, _sc.totB)) : _u_soma(bArr);
    var u_totC = _u_firstNonEmpty(d.Tot_C, _sc.totC) !== '' ? _u_toNum(_u_firstNonEmpty(d.Tot_C, _sc.totC)) : _u_soma(cArr);
    var u_totD = _u_firstNonEmpty(d.Tot_D, _sc.totD) !== '' ? _u_toNum(_u_firstNonEmpty(d.Tot_D, _sc.totD)) : _u_soma(dArr);
    var u_totE = _u_firstNonEmpty(d.Tot_E, _sc.totE) !== '' ? _u_toNum(_u_firstNonEmpty(d.Tot_E, _sc.totE)) : _u_soma(eArr);
    var u_totDis = _u_firstNonEmpty(d.Tot_Dis, _sc.totDis) !== '' ? _u_toNum(_u_firstNonEmpty(d.Tot_Dis, _sc.totDis)) : _u_soma(disArr);
    var u_totI = _u_firstNonEmpty(d.Tot_I, _sc.totI) !== '' ? _u_toNum(_u_firstNonEmpty(d.Tot_I, _sc.totI)) : _u_soma(iArr);

    var u_nB = _u_firstNonEmpty(d.N_B_GE2, _sc.nB) !== '' ? _u_toNum(_u_firstNonEmpty(d.N_B_GE2, _sc.nB)) : _u_count2(bArr);
    var u_nC = _u_firstNonEmpty(d.N_C_GE2, _sc.nC) !== '' ? _u_toNum(_u_firstNonEmpty(d.N_C_GE2, _sc.nC)) : _u_count2(cArr);
    var u_nD = _u_firstNonEmpty(d.N_D_GE2, _sc.nD) !== '' ? _u_toNum(_u_firstNonEmpty(d.N_D_GE2, _sc.nD)) : _u_count2(dArr);
    var u_nE = _u_firstNonEmpty(d.N_E_GE2, _sc.nE) !== '' ? _u_toNum(_u_firstNonEmpty(d.N_E_GE2, _sc.nE)) : _u_count2(eArr);
    var u_nDis = _u_firstNonEmpty(d.N_Dis_GE2, _sc.nDis) !== '' ? _u_toNum(_u_firstNonEmpty(d.N_Dis_GE2, _sc.nDis)) : _u_count2(disArr);
    var u_nI = _u_firstNonEmpty(d.N_I_GE2, _sc.nI) !== '' ? _u_toNum(_u_firstNonEmpty(d.N_I_GE2, _sc.nI)) : _u_count2(iArr);

    var u_totalSint = _u_firstNonEmpty(d.TotalSintomatico, _sc.totalSintomatico) !== ''
                    ? _u_toNum(_u_firstNonEmpty(d.TotalSintomatico, _sc.totalSintomatico))
                    : (u_totB + u_totC + u_totD + u_totE);

    var u_banda = _u_firstNonEmpty(d.Banda, _sc.banda);
    if (!u_banda) {
      if (u_totalSint <= 19)      u_banda = 'MÍNIMA';
      else if (u_totalSint <= 34) u_banda = 'LIGEIRA';
      else if (u_totalSint <= 49) u_banda = 'MODERADA';
      else                        u_banda = 'SEVERA';
    }

    // Critérios DSM-5-TR
    var u_durNum = _u_toNum(u_dur);
    var u_iniNum = _u_toNum(u_ini);
    var u_critA = (d.CritA != null) ? _u_flag(d.CritA, true) : (u_nEventos >= 1 ? 'SIM' : 'NÃO');
    var u_critB = (d.CritB != null) ? _u_flag(d.CritB, true) : (u_nB >= 1 ? 'SIM' : 'NÃO');
    var u_critC = (d.CritC != null) ? _u_flag(d.CritC, true) : (u_nC >= 1 ? 'SIM' : 'NÃO');
    var u_critD = (d.CritD != null) ? _u_flag(d.CritD, true) : (u_nD >= 2 ? 'SIM' : 'NÃO');
    var u_critE = (d.CritE != null) ? _u_flag(d.CritE, true) : (u_nE >= 2 ? 'SIM' : 'NÃO');
    var u_critF = (d.CritF != null) ? _u_flag(d.CritF, true) : (u_durNum >= 1 ? 'SIM' : 'NÃO');
    var u_critG = (d.CritG != null) ? _u_flag(d.CritG, true) : (u_nI >= 1 ? 'SIM' : 'NÃO');
    var u_critsCumpridos = [u_critA,u_critB,u_critC,u_critD,u_critE,u_critF,u_critG].filter(function(x){return x==='SIM';}).length;
    var u_regra = u_critsCumpridos === 7 ? 'SIM' : 'NÃO';

    // Especificadores
    var u_dissoc = (d.EspDissociativo != null)
      ? (String(d.EspDissociativo).toUpperCase() === 'POSITIVO' ? 'POSITIVO' : 'NEGATIVO')
      : (u_nDis >= 1 ? 'POSITIVO' : 'NEGATIVO');
    var u_tardia = (d.EspExpressaoTardia != null)
      ? (String(d.EspExpressaoTardia).toUpperCase() === 'POSITIVO' ? 'POSITIVO' : 'NEGATIVO')
      : (u_iniNum >= 6 ? 'POSITIVO' : 'NEGATIVO');

    // Padrão T1-T5
    var u_padTag    = _u_firstNonEmpty(d.PadraoTag, (_sc.padrao && _sc.padrao.tag));
    var u_padLabel  = _u_firstNonEmpty(d.PadraoLabel, (_sc.padrao && _sc.padrao.label));
    var u_padAcao   = _u_firstNonEmpty(d.PadraoAcao, (_sc.padrao && _sc.padrao.acao));
    if (!u_padTag) {
      if (u_nEventos >= 2 && u_totalSint >= 50 && u_nI >= 3) {
        u_padTag = 'T5'; u_padLabel = 'Quadro complexo';
        u_padAcao = 'Articulação pedopsiquiátrica imediata. Plano integrado.';
      } else if (u_regra === 'SIM' && u_dissoc === 'POSITIVO') {
        u_padTag = 'T4'; u_padLabel = 'PSPT com especificador dissociativo';
        u_padAcao = 'Como T3 + adaptação a fenómenos dissociativos. Estabilização prévia.';
      } else if (u_regra === 'SIM') {
        u_padTag = 'T3'; u_padLabel = 'PSPT provável';
        u_padAcao = 'Avaliação clínica aprofundada (CAPS-CA-5 ou UCLA PTSD-RI). Intervenção TF-CBT ou EMDR.';
      } else if (u_totalSint >= 20 && u_totalSint <= 34) {
        u_padTag = 'T2'; u_padLabel = 'Sintomatologia subliminar';
        u_padAcao = 'Acompanhamento clínico. Psicoeducação. Reavaliar em 1–3 meses.';
      } else {
        u_padTag = 'T1'; u_padLabel = 'Sem sintomatologia clinicamente significativa';
        u_padAcao = 'Monitorização passiva. Reavaliar se surgirem novos sintomas.';
      }
    }

    return [
      hoje, u_patientCode, u_nomeCrianca, u_idade, u_sexo,
      u_dataApl, u_avaliador, u_nomeInform, u_informante, u_contexto,
      u_nEventos, u_evMarcados, u_evIdades,
      u_indTipo, u_indIdade, u_indModalidade, u_indDescricao,
      u_B1, u_B2, u_B3, u_B4, u_B5,
      u_C1, u_C2,
      u_D1, u_D2, u_D3, u_D4, u_D5, u_D6, u_D7,
      u_E1, u_E2, u_E3, u_E4, u_E5, u_E6,
      u_Dis1, u_Dis2,
      u_I1, u_I2, u_I3, u_I4, u_I5,
      u_dur, u_ini,
      u_totB, u_totC, u_totD, u_totE, u_totDis, u_totI,
      u_nB, u_nC, u_nD, u_nE, u_nDis, u_nI,
      u_totalSint, u_banda,
      u_critA, u_critB, u_critC, u_critD, u_critE, u_critF, u_critG,
      u_critsCumpridos, u_regra,
      u_dissoc, u_tardia,
      u_padTag, u_padLabel, u_padAcao,
      _u_jsonField(d.Respostas || d.respostas || { eventos: d.eventos, indice: d.indice, itens: d.itens, duracao: d.duracao, inicio: d.inicio })
    ];
  }

  // ══════════════════════════════════════════════════════════════
  // ISAS · Inventário de Afirmações sobre Autolesão (Klonsky & Glenn, 2009)
  // ══════════════════════════════════════════════════════════════
  // Auto-resposta · 12-25 anos · Sec. I (caracterização) + Sec. II (39 itens Likert 0-2)
  // 13 funções (6 intrapessoais + 7 interpessoais) · Total 0-78
  // Aceita 2 formatos de payload, com fallbacks defensivos:
  //   (a) achatado: d.Reg_Afecto, d.Total, d.PerfilFuncional, d.Comp_Cortar… (formato nativo do HTML)
  //   (b) aninhado: d.scores.RA, d.scores.TOTAL, d.scores.perfilFuncional, d.seccaoI.counts.cortar…
  // Se os scores não vierem calculados, são reconstruídos aqui com a mesma lógica do HTML
  // (Função 0-6 / Intra 0-36 / Inter 0-42 / Total 0-78; bandas e perfil aplicados localmente)
  if (abaNome === 'ISAS') {

    // -- helpers locais (encapsulados — não colidem com outros ramos) --
    function _i_firstNonEmpty() {
      for (var i = 0; i < arguments.length; i++) {
        var v = arguments[i];
        if (v !== undefined && v !== null && v !== '') return v;
      }
      return '';
    }
    function _i_toNum(v) {
      if (v === undefined || v === null || v === '') return 0;
      var n = (typeof v === 'number') ? v : parseFloat(v);
      return isNaN(n) ? 0 : n;
    }
    function _i_jsonField(v) {
      if (v === undefined || v === null) return '';
      if (typeof v === 'string') return v;
      try { return JSON.stringify(v); } catch (e) { return ''; }
    }

    // -- Identificação --
    var i_patientCode = _i_firstNonEmpty(d.patientCode, d.codigo, d.Código, d['Código'], cod);
    var i_nomeCrianca = _i_firstNonEmpty(d.nomeCrianca, d.NomeCrianca, d['NomeCriança'], d.nome_crianca, d.childName, nome);
    var i_dataNasc    = _i_firstNonEmpty(d.dataNasc, d.DataNasc, d.dob, d.data_nasc);
    var i_idade       = _i_firstNonEmpty(d.idade, d.Idade, d.age);
    var i_sexo        = _i_firstNonEmpty(d.sexo, d.Sexo, d.sex, d.gender);
    var i_dataApl     = _i_firstNonEmpty(d.DataAplicacao, d.dataAplicacao, d.data_aplicacao, d.dataAvaliacao);
    var i_avaliador   = _i_firstNonEmpty(d.Avaliador, d.avaliador, d.psicologo);
    var i_contexto    = _i_firstNonEmpty(d.Contexto, d.contexto);
    var i_informante  = _i_firstNonEmpty(d.Informante, d.informante, 'Auto-resposta');
    var i_nomeInform  = _i_firstNonEmpty(d.NomeInformante, d.nome_informante, d.nomeInformante, i_nomeCrianca);

    // -- Secção I — comportamentos (contagens) --
    var _s1 = (d.seccaoI && typeof d.seccaoI === 'object') ? d.seccaoI : {};
    var _s1c = (_s1.counts && typeof _s1.counts === 'object') ? _s1.counts : {};
    function _i_comp(key, aliases) {
      // Aceita achatado (d.Comp_Cortar) ou aninhado (d.seccaoI.counts.cortar)
      for (var i = 0; i < aliases.length; i++) {
        if (d[aliases[i]] !== undefined && d[aliases[i]] !== null && d[aliases[i]] !== '') return d[aliases[i]];
      }
      return _s1c[key] !== undefined && _s1c[key] !== null && _s1c[key] !== '' ? _s1c[key] : '';
    }
    var i_cortar     = _i_comp('cortar',     ['Comp_Cortar']);
    var i_arranhar   = _i_comp('arranhar',   ['Comp_Arranhar']);
    var i_morder     = _i_comp('morder',     ['Comp_Morder']);
    var i_bater      = _i_comp('bater',      ['Comp_Bater']);
    var i_queimar    = _i_comp('queimar',    ['Comp_Queimar']);
    var i_interferir = _i_comp('interferir', ['Comp_Interferir']);
    var i_esculpir   = _i_comp('esculpir',   ['Comp_Esculpir']);
    var i_esfregar   = _i_comp('esfregar',   ['Comp_Esfregar']);
    var i_beliscar   = _i_comp('beliscar',   ['Comp_Beliscar']);
    var i_agulhas    = _i_comp('agulhas',    ['Comp_Agulhas']);
    var i_cabelos    = _i_comp('cabelos',    ['Comp_Cabelos']);
    var i_engolir    = _i_comp('engolir',    ['Comp_Engolir']);
    var i_outroTipo  = _i_firstNonEmpty(d.Comp_Outro_Tipo, _s1.outroTipo);
    var i_outroN     = _i_firstNonEmpty(d.Comp_Outro_N,    _s1.outroN);
    var i_formaP     = _i_firstNonEmpty(d.FormaPrincipal,  _s1.formaPrincipal);
    var i_idP        = _i_firstNonEmpty(d.IdadePrimeira,   _s1.idadePrimeira);
    var i_idU        = _i_firstNonEmpty(d.IdadeUltima,     _s1.idadeUltima);
    var i_dor        = _i_firstNonEmpty(d.DorFisica,       _s1.dorFisica);
    var i_soz        = _i_firstNonEmpty(d.Sozinha,         _s1.sozinha);
    var i_intervalo  = _i_firstNonEmpty(d.IntervaloImpulso,_s1.intervalo);
    var i_querParar  = _i_firstNonEmpty(d.QuerParar,       _s1.querParar);

    // -- Secção II — 39 itens Likert 0-2 --
    // Aceita: d.respostas (array de 39 valores), d.seccaoII (array), ou achatado d.I01..d.I39
    var _resp = null;
    if (Array.isArray(d.respostas))        _resp = d.respostas;
    else if (Array.isArray(d.seccaoII))    _resp = d.seccaoII;
    else if (d.seccaoII && Array.isArray(d.seccaoII)) _resp = d.seccaoII;
    else _resp = [];
    function _i_item(n) {
      // n: 1..39
      var key = 'I' + (n < 10 ? '0' + n : '' + n);
      if (d[key] !== undefined && d[key] !== null && d[key] !== '') return d[key];
      if (_resp && _resp[n-1] !== undefined && _resp[n-1] !== null) return _resp[n-1];
      return '';
    }
    var i_itens = [];
    for (var k = 1; k <= 39; k++) i_itens.push(_i_item(k));

    // -- Scores (calcular se não vierem) --
    // FUNCS map: cada função tem 3 itens (1-indexed)
    var ISAS_FUNCS = {
      RA: [1,14,27], AD: [5,18,31], AS: [6,19,32], MS: [11,24,37], AP: [3,16,29], EN: [10,23,36],   // 6 intrapessoais
      AU: [13,26,39], LI: [2,15,28], IN: [9,22,35], VP: [8,21,34], VG: [12,25,38], AC: [4,17,30], PS: [7,20,33]  // 7 interpessoais
    };
    function _i_funcScore(code) {
      var its = ISAS_FUNCS[code];
      var s = 0;
      for (var j = 0; j < its.length; j++) {
        var v = i_itens[its[j]-1];
        s += _i_toNum(v);
      }
      return s;
    }
    var _sc = (d.scores && typeof d.scores === 'object') ? d.scores : {};
    var sRA = _i_firstNonEmpty(d.Reg_Afecto,  d.RA, _sc.RA) || _i_funcScore('RA');
    var sAD = _i_firstNonEmpty(d.Anti_Dissoc, d.AD, _sc.AD) || _i_funcScore('AD');
    var sAS = _i_firstNonEmpty(d.Anti_Suic,   d.AS, _sc.AS) || _i_funcScore('AS');
    var sMS = _i_firstNonEmpty(d.MarcarSof,   d.MS, _sc.MS) || _i_funcScore('MS');
    var sAP = _i_firstNonEmpty(d.AutoPun,     d.AP, _sc.AP) || _i_funcScore('AP');
    var sEN = _i_firstNonEmpty(d.Endurec,     d.EN, _sc.EN) || _i_funcScore('EN');
    var sAU = _i_firstNonEmpty(d.Autonomia,   d.AU, _sc.AU) || _i_funcScore('AU');
    var sLI = _i_firstNonEmpty(d.LimitesInt,  d.LI, _sc.LI) || _i_funcScore('LI');
    var sIN = _i_firstNonEmpty(d.Influencia,  d.IN, _sc.IN) || _i_funcScore('IN');
    var sVP = _i_firstNonEmpty(d.Vinculacao,  d.VP, _sc.VP) || _i_funcScore('VP');
    var sVG = _i_firstNonEmpty(d.Vinganca,    d.VG, _sc.VG) || _i_funcScore('VG');
    var sAC = _i_firstNonEmpty(d.AutoCuid,    d.AC, _sc.AC) || _i_funcScore('AC');
    var sPS = _i_firstNonEmpty(d.ProcuraSen,  d.PS, _sc.PS) || _i_funcScore('PS');

    // Domínios
    var sIntra = _i_toNum(_i_firstNonEmpty(d.Intrapessoal, _sc.INTRA, _sc.intra));
    if (!sIntra) sIntra = _i_toNum(sRA) + _i_toNum(sAD) + _i_toNum(sAS) + _i_toNum(sMS) + _i_toNum(sAP) + _i_toNum(sEN);
    var sInter = _i_toNum(_i_firstNonEmpty(d.Interpessoal, _sc.INTER, _sc.inter));
    if (!sInter) sInter = _i_toNum(sAU) + _i_toNum(sLI) + _i_toNum(sIN) + _i_toNum(sVP) + _i_toNum(sVG) + _i_toNum(sAC) + _i_toNum(sPS);
    var sTotal = _i_toNum(_i_firstNonEmpty(d.Total, _sc.TOTAL, _sc.total));
    if (!sTotal) sTotal = sIntra + sInter;

    // Perfil funcional
    function _i_intensIntra(n) { n = _i_toNum(n); if (n <= 12) return 'Baixa'; if (n <= 24) return 'Média'; return 'Alta'; }
    function _i_intensInter(n) { n = _i_toNum(n); if (n <= 14) return 'Baixa'; if (n <= 28) return 'Média'; return 'Alta'; }
    var perfilCalc;
    var intraI = _i_intensIntra(sIntra), interI = _i_intensInter(sInter);
    if (intraI === 'Baixa' && interI === 'Baixa')      perfilCalc = 'Baixo investimento funcional';
    else if (interI === 'Baixa')                        perfilCalc = 'Intrapessoal predominante';
    else if (intraI === 'Baixa')                        perfilCalc = 'Interpessoal predominante';
    else                                                perfilCalc = 'Misto';
    var sPerfil = _i_firstNonEmpty(d.PerfilFuncional, _sc.perfilFuncional, _sc.perfil, perfilCalc);

    // Top 3 funções (códigos ordenados por intensidade — desempate alfabético)
    var FUNC_CODES = ['RA','AD','AS','MS','AP','EN','AU','LI','IN','VP','VG','AC','PS'];
    var FUNC_SCORES = { RA:_i_toNum(sRA), AD:_i_toNum(sAD), AS:_i_toNum(sAS), MS:_i_toNum(sMS), AP:_i_toNum(sAP), EN:_i_toNum(sEN), AU:_i_toNum(sAU), LI:_i_toNum(sLI), IN:_i_toNum(sIN), VP:_i_toNum(sVP), VG:_i_toNum(sVG), AC:_i_toNum(sAC), PS:_i_toNum(sPS) };
    var ranked = FUNC_CODES.slice().sort(function(a,b){
      if (FUNC_SCORES[b] !== FUNC_SCORES[a]) return FUNC_SCORES[b] - FUNC_SCORES[a];
      return a < b ? -1 : (a > b ? 1 : 0);
    });
    var top3Calc = ranked.filter(function(c){ return FUNC_SCORES[c] > 0; }).slice(0, 3);
    var sTop1 = _i_firstNonEmpty(d.Top1, (Array.isArray(d.top3) && d.top3[0]) || (_sc.top3 && _sc.top3[0]), top3Calc[0] || '');
    var sTop2 = _i_firstNonEmpty(d.Top2, (Array.isArray(d.top3) && d.top3[1]) || (_sc.top3 && _sc.top3[1]), top3Calc[1] || '');
    var sTop3 = _i_firstNonEmpty(d.Top3, (Array.isArray(d.top3) && d.top3[2]) || (_sc.top3 && _sc.top3[2]), top3Calc[2] || '');

    // Alertas (níveis: '', 'medio', 'alto')
    function _i_alerta(n) { n = _i_toNum(n); if (n >= 4) return 'alto'; if (n >= 2) return 'medio'; return ''; }
    var _al = (d.alertas && typeof d.alertas === 'object') ? d.alertas : {};
    var sAlAS = _i_firstNonEmpty(d.AlertaAS, _al.AS, _al.as, _i_alerta(sAS));
    var sAlAP = _i_firstNonEmpty(d.AlertaAP, _al.AP, _al.ap, _i_alerta(sAP));
    var sAlIN_alerta = (_i_toNum(sIN) >= 4) ? 'alto' : '';
    var sAlIN = _i_firstNonEmpty(d.AlertaIN, _al.IN, _al.in, sAlIN_alerta);

    return [
      hoje, i_patientCode, i_nomeCrianca, i_dataNasc, i_idade, i_sexo,
      i_dataApl, i_avaliador, i_contexto,
      i_informante, i_nomeInform,
      // Sec. I — comportamentos
      i_cortar, i_arranhar, i_morder, i_bater, i_queimar,
      i_interferir, i_esculpir, i_esfregar, i_beliscar,
      i_agulhas, i_cabelos, i_engolir,
      i_outroTipo, i_outroN,
      i_formaP, i_idP, i_idU,
      i_dor, i_soz, i_intervalo, i_querParar,
      // Sec. II — 39 itens
      i_itens[0],  i_itens[1],  i_itens[2],  i_itens[3],  i_itens[4],  i_itens[5],  i_itens[6],  i_itens[7],  i_itens[8],  i_itens[9],
      i_itens[10], i_itens[11], i_itens[12], i_itens[13], i_itens[14], i_itens[15], i_itens[16], i_itens[17], i_itens[18], i_itens[19],
      i_itens[20], i_itens[21], i_itens[22], i_itens[23], i_itens[24], i_itens[25], i_itens[26], i_itens[27], i_itens[28], i_itens[29],
      i_itens[30], i_itens[31], i_itens[32], i_itens[33], i_itens[34], i_itens[35], i_itens[36], i_itens[37], i_itens[38],
      // Scores das 13 funções
      sRA, sAD, sAS, sMS, sAP, sEN,
      sAU, sLI, sIN, sVP, sVG, sAC, sPS,
      // Domínios e perfil
      sIntra, sInter, sTotal, sPerfil,
      // Top 3
      sTop1, sTop2, sTop3,
      // Alertas
      sAlAS, sAlAP, sAlIN,
      // JSON com respostas brutas
      _i_jsonField(d.Respostas || d.respostas || { seccaoI: d.seccaoI, seccaoII: _resp })
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FAMÍLIA FASA / FAS — Acomodação Familiar (Ansiedade · Lebowitz / TOC · Calvocoressi-Flessner)
  // 6 instrumentos partilham helpers comuns; cada case constrói row na ordem dos HEADERS
  // ─────────────────────────────────────────────────────────────────────────────
  function _fas_pickStr(/* aliases... */) {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  }
  function _fas_pickNum(/* aliases... */) {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v === 0 || v === '0') return 0;
      if (v !== undefined && v !== null && v !== '' && !isNaN(Number(v))) return Number(v);
    }
    return '';
  }
  function _fas_jsonField(v) {
    if (v === undefined || v === null) return '';
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v); } catch (e) { return ''; }
  }

  // ── FASA Parental — 13 itens, sem Bloco D ─────────────────────────────
  if (abaNome === 'FASA_Parental') {
    return [
      hoje,
      _fas_pickStr(d.patientCode, d.codigo, d['Código'], cod),
      _fas_pickStr(d.nomeCrianca, d.NomeCrianca, d['NomeCriança'], d.nome_crianca, nome),
      _fas_pickStr(d.nome_informante, d.NomeInformante, d.nomeInformante),
      _fas_pickStr(d.relacao, d['Relação'], d.Relacao, d.informante),
      _fas_pickStr(d.idadeCrianca, d.idade, d['Idade']),
      _fas_pickStr(d.sexoCrianca, d.sexo, d['Sexo']),
      _fas_pickNum(d.PAR, d.par),
      _fas_pickNum(d.MOD, d.mod),
      _fas_pickNum(d.Total, d.total),
      _fas_pickStr(d.MediaItem, d.mediaItem),
      _fas_pickNum(d.SOF, d.sof),
      _fas_pickStr(d.RC, d.rc),
      _fas_pickNum(d.CMO, d.cmo),
      _fas_jsonField(d.Respostas || d.respostas)
    ];
  }

  // ── FASA CR Infância — 16 itens (com Bloco D crenças) — Acompanhamento ──
  if (abaNome === 'FASA_CR_Infancia') {
    return [
      hoje,
      _fas_pickStr(d.patientCode, d.codigo, d['Código'], cod),
      _fas_pickStr(d.nomeCrianca, d.NomeCrianca, d['NomeCriança'], d.nome_crianca, nome),
      _fas_pickStr(d.nome_informante, d.NomeInformante, d.nomeInformante),
      _fas_pickStr(d.relacao, d.Acompanhamento, d.acompanhamento, d.informante),
      _fas_pickStr(d.idadeCrianca, d.idade, d['Idade']),
      _fas_pickStr(d.sexoCrianca, d.sexo, d['Sexo']),
      _fas_pickNum(d.PAR, d.par),
      _fas_pickNum(d.MOD, d.mod),
      _fas_pickNum(d.Total, d.total),
      _fas_pickStr(d.MediaItem, d.mediaItem),
      _fas_pickNum(d.SOF, d.sof),
      _fas_pickStr(d.RC, d.rc),
      _fas_pickNum(d.CMO, d.cmo),
      _fas_pickNum(d.UP, d.up),
      _fas_pickNum(d.DC, d.dc),
      _fas_pickNum(d.AENA, d.aena),
      _fas_pickNum(d.IRC, d.irc),
      _fas_jsonField(d.Respostas || d.respostas)
    ];
  }

  // ── FASA CR Adolescência — 16 itens (com Bloco D crenças) — Contexto ──
  if (abaNome === 'FASA_CR_Adolescencia') {
    return [
      hoje,
      _fas_pickStr(d.patientCode, d.codigo, d['Código'], cod),
      _fas_pickStr(d.nomeCrianca, d.NomeCrianca, d['NomeCriança'], d.nome_crianca, nome),
      _fas_pickStr(d.nome_informante, d.NomeInformante, d.nomeInformante),
      _fas_pickStr(d.relacao, d.Contexto, d.contexto, d.informante),
      _fas_pickStr(d.idadeCrianca, d.idade, d['Idade']),
      _fas_pickStr(d.sexoCrianca, d.sexo, d['Sexo']),
      _fas_pickNum(d.PAR, d.par),
      _fas_pickNum(d.MOD, d.mod),
      _fas_pickNum(d.Total, d.total),
      _fas_pickStr(d.MediaItem, d.mediaItem),
      _fas_pickNum(d.SOF, d.sof),
      _fas_pickStr(d.RC, d.rc),
      _fas_pickNum(d.CMO, d.cmo),
      _fas_pickNum(d.UP, d.up),
      _fas_pickNum(d.DC, d.dc),
      _fas_pickNum(d.AENA, d.aena),
      _fas_pickNum(d.IRC, d.irc),
      _fas_jsonField(d.Respostas || d.respostas)
    ];
  }

  // ── FAS Parental (TOC) — checklist + 13 itens (sem Bloco D) ──
  if (abaNome === 'FAS_Parental') {
    return [
      hoje,
      _fas_pickStr(d.patientCode, d.codigo, d['Código'], cod),
      _fas_pickStr(d.nomeCrianca, d.NomeCrianca, d['NomeCriança'], d.nome_crianca, nome),
      _fas_pickStr(d.nome_informante, d.NomeInformante, d.nomeInformante),
      _fas_pickStr(d.relacao, d['Relação'], d.Relacao, d.informante),
      _fas_pickStr(d.idadeCrianca, d.idade, d['Idade']),
      _fas_pickStr(d.sexoCrianca, d.sexo, d['Sexo']),
      _fas_pickNum(d.Obs, d.obs),
      _fas_pickNum(d.Comp, d.comp),
      _fas_pickNum(d.DS, d.ds),
      _fas_pickNum(d.DOC, d.doc),
      _fas_pickNum(d.PAR, d.par),
      _fas_pickNum(d.MOD, d.mod),
      _fas_pickNum(d.Total, d.total),
      _fas_pickStr(d.MediaItem, d.mediaItem),
      _fas_pickNum(d.SOF, d.sof),
      _fas_pickStr(d.RC, d.rc),
      _fas_pickNum(d.CMO, d.cmo),
      _fas_pickStr(d.RAS, d.ras),
      _fas_pickStr(d.Categorias, d.categorias),
      _fas_jsonField(d.Checklist || d.checklist),
      _fas_jsonField(d.Respostas || d.respostas)
    ];
  }

  // ── FAS CR Infância (TOC) — checklist + 16 itens (com Bloco D) — Acompanhamento ──
  if (abaNome === 'FAS_CR_Infancia') {
    return [
      hoje,
      _fas_pickStr(d.patientCode, d.codigo, d['Código'], cod),
      _fas_pickStr(d.nomeCrianca, d.NomeCrianca, d['NomeCriança'], d.nome_crianca, nome),
      _fas_pickStr(d.nome_informante, d.NomeInformante, d.nomeInformante),
      _fas_pickStr(d.relacao, d.Acompanhamento, d.acompanhamento, d.informante),
      _fas_pickStr(d.idadeCrianca, d.idade, d['Idade']),
      _fas_pickStr(d.sexoCrianca, d.sexo, d['Sexo']),
      _fas_pickNum(d.Obs, d.obs),
      _fas_pickNum(d.Comp, d.comp),
      _fas_pickNum(d.DS, d.ds),
      _fas_pickNum(d.DOC, d.doc),
      _fas_pickNum(d.PAR, d.par),
      _fas_pickNum(d.MOD, d.mod),
      _fas_pickNum(d.Total, d.total),
      _fas_pickStr(d.MediaItem, d.mediaItem),
      _fas_pickNum(d.SOF, d.sof),
      _fas_pickStr(d.RC, d.rc),
      _fas_pickNum(d.CMO, d.cmo),
      _fas_pickStr(d.RAS, d.ras),
      _fas_pickStr(d.Categorias, d.categorias),
      _fas_pickNum(d.UP, d.up),
      _fas_pickNum(d.DC, d.dc),
      _fas_pickNum(d.AENA, d.aena),
      _fas_pickNum(d.IRC, d.irc),
      _fas_jsonField(d.Checklist || d.checklist),
      _fas_jsonField(d.Respostas || d.respostas)
    ];
  }

  // ── FAS CR Adolescência (TOC) — checklist + 16 itens (com Bloco D) — Contexto ──
  if (abaNome === 'FAS_CR_Adolescencia') {
    return [
      hoje,
      _fas_pickStr(d.patientCode, d.codigo, d['Código'], cod),
      _fas_pickStr(d.nomeCrianca, d.NomeCrianca, d['NomeCriança'], d.nome_crianca, nome),
      _fas_pickStr(d.nome_informante, d.NomeInformante, d.nomeInformante),
      _fas_pickStr(d.relacao, d.Contexto, d.contexto, d.informante),
      _fas_pickStr(d.idadeCrianca, d.idade, d['Idade']),
      _fas_pickStr(d.sexoCrianca, d.sexo, d['Sexo']),
      _fas_pickNum(d.Obs, d.obs),
      _fas_pickNum(d.Comp, d.comp),
      _fas_pickNum(d.DS, d.ds),
      _fas_pickNum(d.DOC, d.doc),
      _fas_pickNum(d.PAR, d.par),
      _fas_pickNum(d.MOD, d.mod),
      _fas_pickNum(d.Total, d.total),
      _fas_pickStr(d.MediaItem, d.mediaItem),
      _fas_pickNum(d.SOF, d.sof),
      _fas_pickStr(d.RC, d.rc),
      _fas_pickNum(d.CMO, d.cmo),
      _fas_pickStr(d.RAS, d.ras),
      _fas_pickStr(d.Categorias, d.categorias),
      _fas_pickNum(d.UP, d.up),
      _fas_pickNum(d.DC, d.dc),
      _fas_pickNum(d.AENA, d.aena),
      _fas_pickNum(d.IRC, d.irc),
      _fas_jsonField(d.Checklist || d.checklist),
      _fas_jsonField(d.Respostas || d.respostas)
    ];
  }

  // ── RSES — Escala de Auto-Estima de Rosenberg (v72.0) ─────────
  // Total 0-30 (pode ser 0); Zscore pode ser 0/negativo; Percentil pode ser 0.
  // Por isso usa-se verificação != null (nunca `|| ''`, que descartaria o 0).
  if (abaNome === 'RSES') {
    var rsesResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : (typeof d.respostas === 'string') ? d.respostas
                 : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeJovem || d.nomeJovem || d.nome || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.contexto || d.Contexto || '',
      d.nome_informante || d.NomeRespondente || d.nomeInformante || '',
      (d.total      != null ? d.total      : ''),
      (d.zscore     != null ? d.zscore     : ''),
      (d.percentil  != null ? d.percentil  : ''),
      d.classificacao || d.Classificacao || '',
      d.grupo || d.Grupo || '',
      rsesResp
    ];
  }

  if (abaNome === 'RBS_R') {
    var rbsResp = (typeof d.Respostas === 'string') ? d.Respostas
                : (typeof d.respostas === 'string') ? d.respostas
                : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.nome_crianca || nome || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.Informante || d.informante || d.relacao || '',
      d.idade || d.Idade || '',
      (d.EST_N != null ? d.EST_N : ''), (d.EST_P != null ? d.EST_P : ''),
      (d.AUT_N != null ? d.AUT_N : ''), (d.AUT_P != null ? d.AUT_P : ''),
      (d.COM_N != null ? d.COM_N : ''), (d.COM_P != null ? d.COM_P : ''),
      (d.RIT_N != null ? d.RIT_N : ''), (d.RIT_P != null ? d.RIT_P : ''),
      (d.SIM_N != null ? d.SIM_N : ''), (d.SIM_P != null ? d.SIM_P : ''),
      (d.RES_N != null ? d.RES_N : ''), (d.RES_P != null ? d.RES_P : ''),
      (d.TOT_N != null ? d.TOT_N : ''), (d.TOT_P != null ? d.TOT_P : ''),
      rbsResp
    ];
  }

  if (abaNome === 'PSI4_adap') {
    var psiResp = (typeof d.Respostas === 'string') ? d.Respostas
                : (typeof d.respostas === 'string') ? d.respostas
                : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.nome_crianca || nome || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.Informante || d.informante || d.relacao || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      (d.MP != null ? d.MP : ''), (d.ID != null ? d.ID : ''), (d.CD != null ? d.CD : ''),
      (d.TOTAL != null ? d.TOTAL : ''), (d.RD != null ? d.RD : ''),
      (d.POMP_MP != null ? d.POMP_MP : ''), (d.POMP_ID != null ? d.POMP_ID : ''),
      (d.POMP_CD != null ? d.POMP_CD : ''), (d.POMP_TOTAL != null ? d.POMP_TOTAL : ''),
      (d.Sentinela != null ? d.Sentinela : (d.sentinela != null ? d.sentinela : '')),
      psiResp
    ];
  }

  // ── FACES-IV adap — v74.0 ─────────────────────────────────────
  if (abaNome === 'FACES_IV_adap') {
    var facesResp = (typeof d.Respostas === 'string') ? d.Respostas
                  : (typeof d.respostas === 'string') ? d.respostas
                  : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.nome_crianca || nome || '',
      d.nome_informante || d.NomeRespondente || d.NomeInformante || d.nomeInformante || '',
      d.relacao || d.Relação || d.Relacao || d.Informante || d.informante || '',
      d.idade || d.Idade || '',
      (d.CE != null ? d.CE : ''), (d.FE != null ? d.FE : ''),
      (d.DES != null ? d.DES : ''), (d.EMA != null ? d.EMA : ''),
      (d.RIG != null ? d.RIG : ''), (d.CAO != null ? d.CAO : ''),
      (d.POMP_CE != null ? d.POMP_CE : ''), (d.POMP_FE != null ? d.POMP_FE : ''),
      (d.POMP_DES != null ? d.POMP_DES : ''), (d.POMP_EMA != null ? d.POMP_EMA : ''),
      (d.POMP_RIG != null ? d.POMP_RIG : ''), (d.POMP_CAO != null ? d.POMP_CAO : ''),
      (d.Racio_Coesao != null ? d.Racio_Coesao : ''),
      (d.Racio_Flex != null ? d.Racio_Flex : ''),
      (d.Racio_Total != null ? d.Racio_Total : ''),
      d.Classificacao || d.classificacao || '',
      (d.Pos_Coesao != null ? d.Pos_Coesao : ''),
      (d.Pos_Flex != null ? d.Pos_Flex : ''),
      facesResp
    ];
  }

  // ── CABS Auto / Hetero — v75.0 (mesma estrutura de colunas) ───
  if (abaNome === 'CABS_Auto' || abaNome === 'CABS_Hetero') {
    var cabsResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : (typeof d.respostas === 'string') ? d.respostas
                 : (typeof d.answers === 'string') ? d.answers
                 : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.nome_crianca || nome || '',
      d.informante || d.Informante || d.relacao || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.idade || d.Idade || '',
      (d.NA_TOTAL != null ? d.NA_TOTAL : (d.NA_Total != null ? d.NA_Total : '')),
      (d.PASSIVO != null ? d.PASSIVO : (d.Passivo != null ? d.Passivo : '')),
      (d.AGRESSIVO != null ? d.AGRESSIVO : (d.Agressivo != null ? d.Agressivo : '')),
      (d.ASSERTIVO != null ? d.ASSERTIVO : (d.Assertivo != null ? d.Assertivo : '')),
      d.CLASS_TOTAL || d.Class_Total || '',
      d.CLASS_PASSIVO || d.Class_Passivo || '',
      d.CLASS_AGRESSIVO || d.Class_Agressivo || '',
      cabsResp
    ];
  }

  // ── SPPA — bateria única «Como é que eu sou?» + Importância — v76.0 ──
  if (abaNome === 'SPPA') {
    var sppaResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : (typeof d.respostas === 'string') ? d.respostas
                 : (typeof d.answers === 'string') ? d.answers
                 : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeJovem || d.nomeJovem || nome || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.anoEsc || d.AnoEsc || '',
      (d.M_ESC != null ? d.M_ESC : ''), (d.M_SOC != null ? d.M_SOC : ''),
      (d.M_ATL != null ? d.M_ATL : ''), (d.M_APF != null ? d.M_APF : ''),
      (d.M_LAB != null ? d.M_LAB : ''), (d.M_ROM != null ? d.M_ROM : ''),
      (d.M_COMP != null ? d.M_COMP : ''), (d.M_AMI != null ? d.M_AMI : ''),
      (d.M_AEG != null ? d.M_AEG : ''),
      (d.IMP_ESC != null ? d.IMP_ESC : ''), (d.IMP_SOC != null ? d.IMP_SOC : ''),
      (d.IMP_ATL != null ? d.IMP_ATL : ''), (d.IMP_APF != null ? d.IMP_APF : ''),
      (d.IMP_LAB != null ? d.IMP_LAB : ''), (d.IMP_ROM != null ? d.IMP_ROM : ''),
      (d.IMP_COMP != null ? d.IMP_COMP : ''), (d.IMP_AMI != null ? d.IMP_AMI : ''),
      (d.N_VALORIZADAS != null ? d.N_VALORIZADAS : ''),
      d.AREAS_VULNERAVEIS || d.AreasVulneraveis || '',
      (d.AnoUS != null ? d.AnoUS : (d.anoUS != null ? d.anoUS : '')),
      sppaResp
    ];
  }

  // ── SPPC — bateria única «Como é que eu sou» + Importância (crianças) — v77.0 ──
  if (abaNome === 'SPPC') {
    var sppcResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : (typeof d.respostas === 'string') ? d.respostas
                 : (typeof d.answers === 'string') ? d.answers
                 : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || nome || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.anoEsc || d.AnoEsc || '',
      (d.M_ESC != null ? d.M_ESC : ''), (d.M_SOC != null ? d.M_SOC : ''),
      (d.M_DESP != null ? d.M_DESP : ''), (d.M_APF != null ? d.M_APF : ''),
      (d.M_COMP != null ? d.M_COMP : ''), (d.M_AEG != null ? d.M_AEG : ''),
      (d.IMP_ESC != null ? d.IMP_ESC : ''), (d.IMP_SOC != null ? d.IMP_SOC : ''),
      (d.IMP_DESP != null ? d.IMP_DESP : ''), (d.IMP_APF != null ? d.IMP_APF : ''),
      (d.IMP_COMP != null ? d.IMP_COMP : ''),
      (d.N_VALORIZADAS != null ? d.N_VALORIZADAS : ''),
      d.AREAS_VULNERAVEIS || d.AreasVulneraveis || '',
      sppcResp
    ];
  }

  // ── SPPC_Professor — Escala de Avaliação do Professor — v77.0 ──
  if (abaNome === 'SPPC_Professor') {
    var sppcProfResp = (typeof d.Respostas === 'string') ? d.Respostas
                     : (typeof d.respostas === 'string') ? d.respostas
                     : (typeof d.answers === 'string') ? d.answers
                     : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || nome || '',
      d.informante || d.Informante || 'Professor(a)',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.anoEsc || d.AnoEsc || '',
      (d.P_ESC != null ? d.P_ESC : ''), (d.P_SOC != null ? d.P_SOC : ''),
      (d.P_DESP != null ? d.P_DESP : ''), (d.P_APF != null ? d.P_APF : ''),
      (d.P_COMP != null ? d.P_COMP : ''),
      sppcProfResp
    ];
  }

  // ── SPPLD — bateria única «Como Eu Sou» + Importância (DAE) — v78.0 ──
  if (abaNome === 'SPPLD') {
    var sppldResp = (typeof d.Respostas === 'string') ? d.Respostas
                  : (typeof d.respostas === 'string') ? d.respostas
                  : (typeof d.answers === 'string') ? d.answers
                  : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeAluno || d.NomeCriança || d.NomeCrianca || nome || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.anoEsc || d.AnoEsc || '',
      (d.M_CIG != null ? d.M_CIG : ''), (d.M_LEIT != null ? d.M_LEIT : ''),
      (d.M_ESCR != null ? d.M_ESCR : ''), (d.M_ORT != null ? d.M_ORT : ''),
      (d.M_MAT != null ? d.M_MAT : ''), (d.M_ATL != null ? d.M_ATL : ''),
      (d.M_SOC != null ? d.M_SOC : ''), (d.M_APF != null ? d.M_APF : ''),
      (d.M_COND != null ? d.M_COND : ''), (d.M_AG != null ? d.M_AG : ''),
      (d.IMP_CIG != null ? d.IMP_CIG : ''), (d.IMP_LEIT != null ? d.IMP_LEIT : ''),
      (d.IMP_ESCR != null ? d.IMP_ESCR : ''), (d.IMP_ORT != null ? d.IMP_ORT : ''),
      (d.IMP_MAT != null ? d.IMP_MAT : ''), (d.IMP_ATL != null ? d.IMP_ATL : ''),
      (d.IMP_SOC != null ? d.IMP_SOC : ''), (d.IMP_APF != null ? d.IMP_APF : ''),
      (d.IMP_COND != null ? d.IMP_COND : ''),
      (d.N_IMPORTANTES != null ? d.N_IMPORTANTES : ''),
      (d.DISC_MEDIA != null ? d.DISC_MEDIA : ''),
      d.DOMINIOS_VULNERAVEIS || d.DominiosVulneraveis || '',
      d.GRUPOS_COMPARACAO || d.GruposComparacao || '',
      sppldResp
    ];
  }

  if (abaNome === 'SPPCS') {
    var sppcsResp = (typeof d.Respostas === 'string') ? d.Respostas
                  : (typeof d.respostas === 'string') ? d.respostas
                  : (typeof d.answers === 'string') ? d.answers
                  : JSON.stringify(d.Respostas || d.respostas || d.answers || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeEstudante || d.nomeEstudante || d.NomeCriança || d.NomeCrianca || nome || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.cursoAno || d.CursoAno || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      (d.AP_CT != null ? d.AP_CT : ''), (d.AP_CESC != null ? d.AP_CESC : ''),
      (d.AP_AS != null ? d.AP_AS : ''), (d.AP_APF != null ? d.AP_APF : ''),
      (d.AP_RP != null ? d.AP_RP : ''), (d.AP_AI != null ? d.AP_AI : ''),
      (d.AP_CI != null ? d.AP_CI : ''), (d.AP_MO != null ? d.AP_MO : ''),
      (d.AP_RA != null ? d.AP_RA : ''), (d.AP_HU != null ? d.AP_HU : ''),
      (d.AP_CRI != null ? d.AP_CRI : ''), (d.AP_CA != null ? d.AP_CA : ''),
      (d.AP_AEG != null ? d.AP_AEG : ''),
      (d.IMP_CT != null ? d.IMP_CT : ''), (d.IMP_CESC != null ? d.IMP_CESC : ''),
      (d.IMP_AS != null ? d.IMP_AS : ''), (d.IMP_APF != null ? d.IMP_APF : ''),
      (d.IMP_RP != null ? d.IMP_RP : ''), (d.IMP_AI != null ? d.IMP_AI : ''),
      (d.IMP_CI != null ? d.IMP_CI : ''), (d.IMP_MO != null ? d.IMP_MO : ''),
      (d.IMP_RA != null ? d.IMP_RA : ''), (d.IMP_HU != null ? d.IMP_HU : ''),
      (d.IMP_CRI != null ? d.IMP_CRI : ''), (d.IMP_CA != null ? d.IMP_CA : ''),
      (d.SS_AmigoIntimo != null ? d.SS_AmigoIntimo : ''),
      (d.SS_Mae != null ? d.SS_Mae : ''),
      (d.SS_Pai != null ? d.SS_Pai : ''),
      (d.SS_Professores != null ? d.SS_Professores : ''),
      (d.SS_OrgAcademicas != null ? d.SS_OrgAcademicas : ''),
      (d.NDominios4 != null ? d.NDominios4 : ''),
      (d.DiscrepGlobal != null ? d.DiscrepGlobal : ''),
      sppcsResp
    ];
  }

  // ── EPCAS-PE — Escala Pictórica de Competência Percebida e Aceitação Social (Harter & Pike) — v80.0 ──
  if (abaNome === 'EPCAS_PE') {
    var epcasResp = (typeof d.Respostas === 'string') ? d.Respostas
                  : (typeof d.respostas === 'string') ? d.respostas
                  : JSON.stringify(d.Respostas || d.respostas || '');
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || nome || '',
      d.genero || d.Género || d.Genero || '',
      d.idade || d.Idade || '',
      d.sala || d.Sala || '',
      d.educador || d.Educador || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      (d.COG_Soma != null ? d.COG_Soma : ''), (d.COG_Med != null ? d.COG_Med : ''),
      (d.FIS_Soma != null ? d.FIS_Soma : ''), (d.FIS_Med != null ? d.FIS_Med : ''),
      (d.PAR_Soma != null ? d.PAR_Soma : ''), (d.PAR_Med != null ? d.PAR_Med : ''),
      (d.PRT_Soma != null ? d.PRT_Soma : ''), (d.PRT_Med != null ? d.PRT_Med : ''),
      (d.APF_Soma != null ? d.APF_Soma : ''), (d.APF_Med != null ? d.APF_Med : ''),
      (d.CG_Med != null ? d.CG_Med : ''), (d.AS_Med != null ? d.AS_Med : ''),
      d.observacoes || d.Observações || d.Observacoes || '',
      epcasResp
    ];
  }

  // ── Diário de Episódios — MODELO POR EPISÓDIO (Ricardina Correia) — v90.0 ──
  // 1 linha = 1 episódio. Dedupe por Código+EpisodioID (ver DEDUPE_KEYS):
  //   episódio novo → nova linha; episódio editado e reenviado → atualiza a mesma linha.
  if (abaNome === 'DIARIO_EPISODIOS') {
    var diaCats = Array.isArray(d.categorias) ? d.categorias.join(', ')
                : (d.categorias || d.Categorias || '');
    var diaIntNum   = (d.intensidade != null && d.intensidade !== '') ? d.intensidade
                    : ((d.Intensidade != null && d.Intensidade !== '') ? d.Intensidade : '');
    var diaIntLabel = d.intensidadeLabel || d.IntensidadeLabel || '';
    var diaIntCell  = diaIntLabel
                    ? (diaIntNum !== '' ? (diaIntNum + ' · ' + diaIntLabel) : diaIntLabel)
                    : diaIntNum;
    var diaResp = (typeof d.Respostas === 'string') ? d.Respostas
                : JSON.stringify(d.Respostas || d.respostas || {});
    return [
      hoje,                                                             // Data
      d.hora || d.Hora || d.time || '',                                 // Hora
      d.patientCode || d.codigo || d.Código || cod || '',               // Código
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || nome || '',    // NomeCriança
      d.informante || d.Informante || '',                              // Informante (tipo)
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',  // NomeInformante
      diaIntCell,                                                       // Intensidade
      diaCats,                                                          // Categorias
      d.oque || d.OQueAconteceu || d.what || '',                        // OQueAconteceu
      d.respostaCrianca || d.RespostaCriança || d.child || '',          // RespostaCriança
      d.respostaCuidadores || d.RespostaCuidadores || d.us || '',       // RespostaCuidadores
      d.episodioId || d.EpisodioID || d.id || '',                       // EpisodioID
      d.timestamp || d.Timestamp || d.ts || '',                         // Timestamp
      diaResp                                                          // Respostas (JSON do episódio)
    ];
  }

  // ── Anamnese Parental Complementar — Recolha da perspetiva do progenitor (Ricardina Correia, 2026) ──
  if (abaNome === 'ANAMNESE_PARENTAL_COMPLEMENTAR') {
    var apcResp = (typeof d.Respostas === 'string') ? d.Respostas
                : JSON.stringify(d.Respostas || d.respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || nome || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.NomeInformante || d.nomeInformante || '',
      d.contacto || d.Contacto || '',
      d.motivacao || d.Motivacao || '',
      d.preocupacao_principal || d.PreocupacaoPrincipal || '',
      d.areas || d.Areas || '',
      d.rotinas || d.Rotinas || '',
      d.corre_bem || d.CorreBem || '',
      d.mais_dificil || d.MaisDificil || '',
      d.evol_positiva || d.EvolPositiva || '',
      d.evol_preocupante || d.EvolPreocupante || '',
      d.info_adicional || d.InfoAdicional || '',
      d.expectativas || d.Expectativas || '',
      d.disponibilidade || d.Disponibilidade || '',
      d.disponib_detalhe || d.DisponibDetalhe || '',
      apcResp,
      d.ts || d.timestamp || d.Timestamp || ''
    ];
  }

  // ── MABC-2 Lista de Verificação — Movement ABC-2 Checklist (Henderson, Sugden & Barnett) ──
  if (abaNome === 'MABC2_Checklist') {
    var mabcResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : JSON.stringify(d.Respostas || d.respostas || []);
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || nome || '',
      d.idade || d.Idade || '',
      d.anoEscolaridade || d.AnoEscolaridade || '',
      d.Informante || d.informante || d.funcao || '',
      d.NomeInformante || d.nome_informante || d.nomeInformante || '',
      d.Relacao || d['Relação'] || d.funcao || d.Informante || '',
      (d.SubtotalA != null ? d.SubtotalA : (d.subA != null ? d.subA : '')),
      (d.SubtotalB != null ? d.SubtotalB : (d.subB != null ? d.subB : '')),
      (d.TotalMotor != null && d.TotalMotor !== '' ? d.TotalMotor : ''),
      (d.SimC != null ? d.SimC : ''),
      d.Flags || '',
      mabcResp
    ];
  }

  // ── SNAP-IV (Versão Reduzida DSM-IV) · médias por item · informante determina limiares ──
  if (abaNome === 'SNAP_IV') {
    var snapResp = (typeof d.answers === 'string') ? d.answers
                 : (typeof d.Respostas === 'string') ? d.Respostas
                 : JSON.stringify(d.answers || d.Respostas || d.respostas || []);
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || '',
      d.idade || d.Idade || '',
      d.sexo || d.Sexo || '',
      d.ano || d.Ano || '',
      (d.DESAT_TOTAL != null ? d.DESAT_TOTAL : ''),
      (d.DESAT_N     != null ? d.DESAT_N     : ''),
      (d.DESAT_MEDIA != null ? d.DESAT_MEDIA : ''),
      (d.HI_TOTAL    != null ? d.HI_TOTAL    : ''),
      (d.HI_N        != null ? d.HI_N        : ''),
      (d.HI_MEDIA    != null ? d.HI_MEDIA    : ''),
      (d.COMB_TOTAL  != null ? d.COMB_TOTAL  : ''),
      (d.COMB_N      != null ? d.COMB_N      : ''),
      (d.COMB_MEDIA  != null ? d.COMB_MEDIA  : ''),
      snapResp
    ];
  }

  if (abaNome === 'GAI') {
    var gaiResp = (typeof d.answers === 'string') ? d.answers
                : (typeof d.Respostas === 'string') ? d.Respostas
                : JSON.stringify(d.answers || d.Respostas || d.respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || d.childName || nome || '',
      d.dob || d.dataNasc || d.DataNasc || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      (d.EIXO_SOMATICO   != null ? d.EIXO_SOMATICO   : ''),
      (d.EIXO_APETITIVO  != null ? d.EIXO_APETITIVO  : ''),
      (d.ALERTAS         != null ? d.ALERTAS         : ''),
      d.MARCADORES_NUTRICIONAIS || '',
      d.OUTRA_COISA || '',
      gaiResp
    ];
  }

  if (abaNome === 'CSHQ_PT_Pais') {
    var cshqResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : JSON.stringify(d.respostas || d.Respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || nome || '',
      d.sexo || d.Sexo || '',
      d.idade || d.Idade || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.relacao || d.Relacao || d['Relação'] || '',
      (d.sub1 != null ? d.sub1 : ''),
      (d.sub2 != null ? d.sub2 : ''),
      (d.sub3 != null ? d.sub3 : ''),
      (d.sub4 != null ? d.sub4 : ''),
      (d.sub5 != null ? d.sub5 : ''),
      (d.sub6 != null ? d.sub6 : ''),
      (d.sub7 != null ? d.sub7 : ''),
      (d.sub8 != null ? d.sub8 : ''),
      (d.ips  != null ? d.ips  : ''),
      d.rastreio || d.Rastreio || '',
      cshqResp
    ];
  }

  if (abaNome === 'SSR_PT') {
    var ssrResp = (typeof d.Respostas === 'string') ? d.Respostas
                : JSON.stringify(d.respostas || d.Respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeJovem || d.NomeCriança || nome || '',
      d.anoEscolaridade || d.AnoEscolaridade || d.ano_escolaridade || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.relacao || d.Relacao || d['Relação'] || 'Próprio/a (autorrelato)',
      d.regrasSono   || d.RegrasSono   || d.regras_sono   || '',
      d.problemasSono|| d.ProblemasSono|| d.problemas_sono|| '',
      d.gostaDormir  || d.GostaDormir  || d.gosta_dormir  || '',
      (d.RD != null ? d.RD : ''),
      (d.IS != null ? d.IS : ''),
      (d.DS != null ? d.DS : ''),
      (d.AS != null ? d.AS : ''),
      (d.DN != null ? d.DN : ''),
      (d.PA != null ? d.PA : ''),
      (d.SD != null ? d.SD : ''),
      (d.total != null ? d.total : ''),
      d.rastreioTotal || d.RastreioTotal || d.rastreio || '',
      ssrResp
    ];
  }

  if (abaNome === 'TSOC_YGTSS') {
    var tsocResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : JSON.stringify(d.respostas || d.Respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || d.relacao || '',
      (d.idade != null ? d.idade : ''),
      d.timestamp || d.Timestamp || '',
      (d.SubtotalMotor_Atual   != null ? d.SubtotalMotor_Atual   : ''),
      (d.SubtotalFonico_Atual  != null ? d.SubtotalFonico_Atual  : ''),
      (d.TotalTiques_Atual     != null ? d.TotalTiques_Atual     : ''),
      (d.Comprometimento_Atual != null ? d.Comprometimento_Atual : ''),
      (d.IndiceComp_Atual      != null ? d.IndiceComp_Atual      : ''),
      (d.Global_Atual          != null ? d.Global_Atual          : ''),
      d.Banda_Atual || '',
      d.Predominio_Atual || '',
      d.Proporcionalidade_Atual || '',
      (d.SubtotalMotor_Pior    != null ? d.SubtotalMotor_Pior    : ''),
      (d.SubtotalFonico_Pior   != null ? d.SubtotalFonico_Pior   : ''),
      (d.TotalTiques_Pior      != null ? d.TotalTiques_Pior      : ''),
      (d.Comprometimento_Pior  != null ? d.Comprometimento_Pior  : ''),
      (d.IndiceComp_Pior       != null ? d.IndiceComp_Pior       : ''),
      (d.Global_Pior           != null ? d.Global_Pior           : ''),
      d.Banda_Pior || '',
      tsocResp
    ];
  }

  if (abaNome === 'A_DES') {
    var adesResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : JSON.stringify(d.respostas || d.Respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || 'Auto-relato',
      (d.idade != null ? d.idade : (d.Idade != null ? d.Idade : '')),
      (d.mediaGlobal != null ? d.mediaGlobal : ''),
      (d.amnesia     != null ? d.amnesia     : ''),
      (d.dpdr        != null ? d.dpdr        : ''),
      (d.absorcao    != null ? d.absorcao    : ''),
      (d.identidade  != null ? d.identidade  : ''),
      (d.transversal != null ? d.transversal : ''),
      d.classificacao || d.Classificacao || '',
      adesResp
    ];
  }

  // ── Fallback genérico ─────────────────────────────────────────
  if (abaNome === 'ACE_Q_ADOLESCENTE' || abaNome === 'ACE_Q_CUIDADOR') {
    var aceResp = (typeof d.Respostas === 'string') ? d.Respostas
                : JSON.stringify(d.respostas || d.Respostas || d.answers || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCriança || d.NomeCrianca || d.childName || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || '',
      d.relacao || d.Relacao || d['Relação'] || '',
      (d.total != null ? d.total : ''),
      d.classificacao || d.Classificação || d.classification || '',
      (d.D1 != null ? d.D1 : ''),
      (d.D2 != null ? d.D2 : ''),
      (d.D3 != null ? d.D3 : ''),
      (d.D4 != null ? d.D4 : ''),
      (d.D5 != null ? d.D5 : ''),
      (d.D6 != null ? d.D6 : ''),
      aceResp
    ];
  }

  if (abaNome === 'CAARMS_ADAP') {
    // Respostas já vem serializada do HTML (respostas+fluidas+observacoes); tolera objecto.
    var caResp = (typeof d.Respostas === 'string') ? d.Respostas
               : JSON.stringify(d.Respostas || d.respostas || {});
    // Guardas != null em todos os campos numéricos para preservar zeros genuínos (índices/somas/IGAD podem ser 0).
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || d.childName || nome || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      (d.idade != null ? d.idade : ''),
      (d.IGAD != null ? d.IGAD : ''),
      (d.IGAD_Bruto != null ? d.IGAD_Bruto : ''),
      (d.Soma_Total != null ? d.Soma_Total : ''),
      d.Banda_IGAD || '',
      (d.D1_Idx != null ? d.D1_Idx : ''), (d.D2_Idx != null ? d.D2_Idx : ''),
      (d.D3_Idx != null ? d.D3_Idx : ''), (d.D4_Idx != null ? d.D4_Idx : ''),
      (d.D5_Idx != null ? d.D5_Idx : ''), (d.D6_Idx != null ? d.D6_Idx : ''),
      (d.D7_Idx != null ? d.D7_Idx : ''), (d.D8_Idx != null ? d.D8_Idx : ''),
      (d.D9_Idx != null ? d.D9_Idx : ''), (d.D10_Idx != null ? d.D10_Idx : ''),
      (d.D1_Soma != null ? d.D1_Soma : ''), (d.D2_Soma != null ? d.D2_Soma : ''),
      (d.D3_Soma != null ? d.D3_Soma : ''), (d.D4_Soma != null ? d.D4_Soma : ''),
      (d.D5_Soma != null ? d.D5_Soma : ''), (d.D6_Soma != null ? d.D6_Soma : ''),
      (d.D7_Soma != null ? d.D7_Soma : ''), (d.D8_Soma != null ? d.D8_Soma : ''),
      (d.D9_Soma != null ? d.D9_Soma : ''), (d.D10_Soma != null ? d.D10_Soma : ''),
      d.Sinalizadores || '',
      caResp
    ];
  }

  if (abaNome === 'CUIDAR_CORPO') {
    // Prova projetiva não-normativa: posições descritivas 1–5 nos eixos + coping (pred/sec) + reparação.
    var ccResp = (typeof d.Respostas === 'string') ? d.Respostas
               : JSON.stringify(d.Respostas || d.respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || d.childName || nome || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      (d.idade != null ? d.idade : ''),
      (d.AX1_Pos != null ? d.AX1_Pos : ''),
      (d.AX2_Pos != null ? d.AX2_Pos : ''),
      d.AX3_Pred || '',
      d.AX3_Sec || '',
      (d.AX4_Pos != null ? d.AX4_Pos : ''),
      d.Reparacao || '',
      d.PerfilResumo || '',
      ccResp
    ];
  }

  if (abaNome === 'CSAS') {
    // Autorrelato criança: Calma invertida já reflectida nas somas enviadas; corte total ≥68 (orientativo).
    var csasResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : JSON.stringify(d.Respostas || d.respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || d.childName || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || '',
      (d.idade != null ? d.idade : ''),
      d.sexo || d.Sexo || '',
      (d.Preocupacao != null ? d.Preocupacao : ''),
      (d.Malestar != null ? d.Malestar : ''),
      (d.Oposicao != null ? d.Oposicao : ''),
      (d.Calma != null ? d.Calma : ''),
      (d.Total != null ? d.Total : ''),
      d.Classificacao || d.classificacao || '',
      csasResp
    ];
  }

  if (abaNome === 'CSAS_P') {
    // Versão pais: Calma directa (fator positivo); Total = Preoc+Opos+Mal+(30−Calma). Sem ponto de corte.
    var csaspResp = (typeof d.Respostas === 'string') ? d.Respostas
                  : JSON.stringify(d.Respostas || d.respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || d.childName || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.relacao || d.Relação || d.Relacao || '',
      (d.idade != null ? d.idade : ''),
      d.sexo || d.Sexo || '',
      (d.Preocupacao != null ? d.Preocupacao : ''),
      (d.Oposicao != null ? d.Oposicao : ''),
      (d.Calma != null ? d.Calma : ''),
      (d.Malestar != null ? d.Malestar : ''),
      (d.Total != null ? d.Total : ''),
      csaspResp
    ];
  }

  if (abaNome === 'SGRS') {
    // Sohn Grayson Rating Scale — 58 itens, 6 domínios, Likert 1–4, sem itens invertidos.
    // Guardas `!= null` em todas as somas/médias/índices (o mínimo por item é 1, mas a guarda
    // preserva qualquer zero genuíno e distingue-o de campo ausente).
    // Médias/índices chegam já formatados em pt-PT ("2,29") — gravar como texto.
    var sgrsResp = (typeof d.Respostas === 'string') ? d.Respostas
                 : JSON.stringify(d.Respostas || d.respostas || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || d.childName || nome || '',
      d.dataNasc || d.DataNasc || d.dob || '',
      (d.idade != null ? d.idade : ''),
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.relacao || d.Relação || d.Relacao || d.informante || d.Informante || '',
      d.localExame || d.LocalExame || '',
      (d.Respondidos != null ? d.Respondidos : ''),
      (d.Omissos != null ? d.Omissos : ''),
      (d.S_Soma  != null ? d.S_Soma  : ''), (d.S_Media != null ? d.S_Media : ''), (d.S_Idx != null ? d.S_Idx : ''),
      (d.C_Soma  != null ? d.C_Soma  : ''), (d.C_Media != null ? d.C_Media : ''), (d.C_Idx != null ? d.C_Idx : ''),
      (d.L_Soma  != null ? d.L_Soma  : ''), (d.L_Media != null ? d.L_Media : ''), (d.L_Idx != null ? d.L_Idx : ''),
      (d.G_Soma  != null ? d.G_Soma  : ''), (d.G_Media != null ? d.G_Media : ''), (d.G_Idx != null ? d.G_Idx : ''),
      (d.P_Soma  != null ? d.P_Soma  : ''), (d.P_Media != null ? d.P_Media : ''), (d.P_Idx != null ? d.P_Idx : ''),
      (d.M_Soma  != null ? d.M_Soma  : ''), (d.M_Media != null ? d.M_Media : ''), (d.M_Idx != null ? d.M_Idx : ''),
      (d.Total_Bruto != null ? d.Total_Bruto : ''),
      (d.Total_Prorrateado != null ? d.Total_Prorrateado : ''),
      (d.Pontuacao_Utilizada != null ? d.Pontuacao_Utilizada : ''),
      d.Base_Cotacao || '',
      d.Banda || '',
      (d.N_Sinalizados != null ? d.N_Sinalizados : ''),
      sgrsResp
    ];
  }

  if (abaNome === 'GAD7') {
    // Escala de Ansiedade Generalizada — 7 itens, escala 0–3, todos directos (sem inversões).
    // Instrumento unidimensional: não há subescalas nem colunas de dimensão.
    // Guardas `!= null` em todos os campos numéricos: o valor 0 é um resultado válido
    // (Total=0 → «Ansiedade mínima»; Max_Item=0 → «Nunca»), pelo que `||` converteria zeros genuínos em ''.
    var gadResp = (typeof d.Respostas === 'string') ? d.Respostas
                : JSON.stringify(d.Respostas || d.respostas || d.answers || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || d.childName || nome || '',
      (d.idade != null ? d.idade : ''),
      d.sexo || d.Sexo || '',
      d.informante || d.Informante || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.momento || d.Momento || '',
      d.contexto || d.Contexto || '',
      (d.N_Respondidos != null ? d.N_Respondidos : (d.nResp != null ? d.nResp : '')),
      (d.Soma != null ? d.Soma : (d.soma != null ? d.soma : '')),
      (d.Total != null ? d.Total : (d.total != null ? d.total : '')),
      (d.Prorratado != null ? d.Prorratado : (d.prorratado != null ? d.prorratado : '')),
      d.Validade || d.validade || '',
      d.Banda || d.banda || '',
      d.Rastreio || d.rastreio || '',
      (d.Pct_Max != null ? d.Pct_Max : (d.pctMax != null ? d.pctMax : '')),
      (d.Itens_GE2 != null ? d.Itens_GE2 : (d.nGE2 != null ? d.nGE2 : '')),
      (d.Max_Item != null ? d.Max_Item : (d.maxItem != null ? d.maxItem : '')),
      d.Item_Mais_Elevado || d.itemMax || '',
      gadResp
    ];
  }

  if (abaNome === 'AIS_8') {
    // Escala de Insónia de Atenas — 8 itens, escala 0–3, todos directos (sem inversões).
    // Guardas `!= null` em todos os campos numéricos: o valor 0 é um resultado válido
    // (Total=0 → «Ausência de insónia»), pelo que `||` converteria zeros genuínos em ''.
    var aisResp = (typeof d.Respostas === 'string') ? d.Respostas
                : JSON.stringify(d.Respostas || d.respostas || d.answers || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeCrianca || d.NomeCrianca || d.NomeCriança || d.childName || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || '',
      (d.idade != null ? d.idade : ''),
      d.sexo || d.Sexo || '',
      d.momento || d.Momento || '',
      (d.Total != null ? d.Total : (d.total != null ? d.total : '')),
      (d.Noturno != null ? d.Noturno : (d.noturno != null ? d.noturno : '')),
      (d.Diurno != null ? d.Diurno : (d.diurno != null ? d.diurno : '')),
      d.Banda || d.banda || '',
      d.Rastreio || d.rastreio || '',
      (d.ItensMaiorIgual2 != null ? d.ItensMaiorIgual2 : ''),
      (d.ItensIgual3 != null ? d.ItensIgual3 : ''),
      aisResp
    ];
  }

  if (abaNome === 'ESS_Epworth') {
    // Escala de Sonolência de Epworth — 8 itens, escala 0–3, todos directos (sem inversões).
    // Guardas `!= null` em TODOS os campos numéricos: neste instrumento o zero é um
    // resultado válido e informativo (Total=0 → «Sonolência normal»; N_Item_3=0 → nenhum
    // item com probabilidade elevada; Veiculo_4_8=0 → nenhuma propensão em contexto de
    // veículo; Dif_G2_G1=0 → perfil plano). `||` converteria esses zeros genuínos em ''.
    // As colunas Total, Max_Item, G1_Media, G2_Media e Dif_G2_G1 ficam VAZIAS quando o
    // protocolo é inválido (R5, menos de 6 itens): vazio = não interpretável, nunca zero.
    var essResp = (typeof d.Respostas === 'string') ? d.Respostas
                : JSON.stringify(d.Respostas || d.respostas || d.answers || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeUtente || d.NomeUtente || d.nomeCrianca || d.NomeCrianca || d.NomeCriança || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || '',
      (d.idade != null ? d.idade : ''),
      d.sexo || d.Sexo || '',
      d.contexto || d.Contexto || '',
      d.item8Aplicavel || d.Item8Aplicavel || '',
      (d.n_respondidos != null ? d.n_respondidos : (d.N_Respondidos != null ? d.N_Respondidos : '')),
      (d.soma != null ? d.soma : (d.Soma != null ? d.Soma : '')),
      (d.total != null ? d.total : (d.Total != null ? d.Total : '')),
      d.natureza || d.Natureza || '',
      d.validade || d.Validade || '',
      d.sistema_a || d.Sistema_A || '',
      d.criterio_pt || d.Criterio_PT || '',
      d.sistema_c || d.Sistema_C || '',
      d.concordancia || d.Concordancia || '',
      (d.g1_soma != null ? d.g1_soma : (d.G1_Soma != null ? d.G1_Soma : '')),
      (d.g1_media != null ? d.g1_media : (d.G1_Media != null ? d.G1_Media : '')),
      (d.g2_soma != null ? d.g2_soma : (d.G2_Soma != null ? d.G2_Soma : '')),
      (d.g2_media != null ? d.g2_media : (d.G2_Media != null ? d.G2_Media : '')),
      (d.dif_g2_g1 != null ? d.dif_g2_g1 : (d.Dif_G2_G1 != null ? d.Dif_G2_G1 : '')),
      (d.max_item != null ? d.max_item : (d.Max_Item != null ? d.Max_Item : '')),
      (d.n_item_3 != null ? d.n_item_3 : (d.N_Item_3 != null ? d.N_Item_3 : '')),
      (d.n_item_2mais != null ? d.n_item_2mais : (d.N_Item_2mais != null ? d.N_Item_2mais : '')),
      (d.n_item_0 != null ? d.n_item_0 : (d.N_Item_0 != null ? d.N_Item_0 : '')),
      (d.veiculo_4_8 != null ? d.veiculo_4_8 : (d.Veiculo_4_8 != null ? d.Veiculo_4_8 : '')),
      d.flag_item3 || d.Flag_Item3 || '',
      d.flag_g2 || d.Flag_G2 || '',
      d.flag_veiculo || d.Flag_Veiculo || '',
      d.flag_idade || d.Flag_Idade || '',
      d.comparabilidade || d.Comparabilidade || '',
      essResp
    ];
  }

  if (abaNome === 'STOPBANG') {
    // STOP-BANG — 8 indicadores binários, total 0–8 (soma simples, sem ponderações).
    // Guardas `!= null` em TODOS os campos numéricos: neste instrumento o zero é um
    // resultado válido e informativo — Cot_* = 0 significa indicador NEGATIVO (facto
    // clínico), SubtotalSTOP/SubtotalBANG = 0 significa bloco sem indicadores, e
    // TotalPT/TotalUHN = 0 significa «Risco baixo», a menor acumulação possível de
    // fatores de risco. `||` converteria todos esses zeros genuínos em '', isto é,
    // faria um protocolo válido e inteiramente negativo parecer um protocolo por
    // preencher. O mesmo vale para Peso, Altura, PerimetroCervical e IMC, que nunca
    // são 0 na prática mas usam a mesma guarda por coerência e para resistir a
    // payloads parciais.
    // As colunas de cotação, subtotais, totais e classificação ficam VAZIAS quando o
    // protocolo é incompleto ou o utente é inelegível (idade < 18): vazio significa
    // não interpretável, nunca zero.
    // ProbabilidadeSAOS e ProbabilidadeSAOSGrave são texto ('64%', '80%', … ou 'n.d.'):
    // 'n.d.' indica ausência de valor publicado por Reis et al. (2015) para a pontuação
    // obtida — não foi efetuada qualquer interpolação.
    var sbResp = (typeof d.Respostas === 'string') ? d.Respostas
               : JSON.stringify(d.Respostas || d.respostas || d.answers || {});
    return [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.nomeUtente || d.NomeUtente || d.nomeCrianca || d.NomeCrianca || d.NomeCriança || nome || '',
      d.nome_informante || d.nomeInformante || d.NomeInformante || '',
      d.informante || d.Informante || '',
      (d.Idade != null ? d.Idade : (d.idade != null ? d.idade : '')),
      d.Sexo || d.sexo || '',
      (d.Peso != null ? d.Peso : (d.peso != null ? d.peso : '')),
      (d.Altura != null ? d.Altura : (d.altura != null ? d.altura : '')),
      (d.PerimetroCervical != null ? d.PerimetroCervical : (d.perimetro != null ? d.perimetro : '')),
      (d.IMC != null ? d.IMC : (d.imc != null ? d.imc : '')),
      d.Ressonar || d.ressonar || '',
      d.Cansaco || d.cansaco || '',
      d.ApneiasObservadas || d.apneiasObservadas || '',
      d.Hipertensao || d.hipertensao || '',
      (d.Cot_S != null ? d.Cot_S : (d.cot_s != null ? d.cot_s : '')),
      (d.Cot_T != null ? d.Cot_T : (d.cot_t != null ? d.cot_t : '')),
      (d.Cot_O != null ? d.Cot_O : (d.cot_o != null ? d.cot_o : '')),
      (d.Cot_P != null ? d.Cot_P : (d.cot_p != null ? d.cot_p : '')),
      (d.Cot_B != null ? d.Cot_B : (d.cot_b != null ? d.cot_b : '')),
      (d.Cot_A != null ? d.Cot_A : (d.cot_a != null ? d.cot_a : '')),
      (d.Cot_N_PT != null ? d.Cot_N_PT : (d.cot_n_pt != null ? d.cot_n_pt : '')),
      (d.Cot_N_UHN != null ? d.Cot_N_UHN : (d.cot_n_uhn != null ? d.cot_n_uhn : '')),
      (d.Cot_G != null ? d.Cot_G : (d.cot_g != null ? d.cot_g : '')),
      (d.SubtotalSTOP != null ? d.SubtotalSTOP : (d.subtotalSTOP != null ? d.subtotalSTOP : '')),
      (d.SubtotalBANG != null ? d.SubtotalBANG : (d.subtotalBANG != null ? d.subtotalBANG : '')),
      (d.TotalPT != null ? d.TotalPT : (d.totalPT != null ? d.totalPT : '')),
      (d.TotalUHN != null ? d.TotalUHN : (d.totalUHN != null ? d.totalUHN : '')),
      d.BandaDocumentoFonte || d.bandaDocumentoFonte || '',
      d.ClassificacaoFinal || d.classificacaoFinal || '',
      d.ClassificacaoUHN || d.classificacaoUHN || '',
      d.Concordancia || d.concordancia || '',
      d.ProbabilidadeSAOS || d.probabilidadeSAOS || '',
      d.ProbabilidadeSAOSGrave || d.probabilidadeSAOSGrave || '',
      d.Elegibilidade || d.elegibilidade || '',
      sbResp
    ];
  }

  // ── EII-PT · Escala de Intolerância à Incerteza (v119.0) ────────────────
  // Ordem das colunas idêntica à de HEADERS['EII27'] / HEADERS['EII12'].
  // As Formas A e J escrevem na MESMA aba da respectiva versão; a coluna 'Forma'
  // distingue-as e o painel reconstrói o texto dos itens a partir dela.
  // ⚠ Guarda != null OBRIGATÓRIA (nunca ||): neste instrumento o ZERO é resultado
  //   legítimo e informativo em três colunas distintas —
  //     *_POMP   = 0 → pontuação no mínimo da amplitude teórica (todos os itens em 1);
  //     Delta_POMP = 0 → Ansiedade Prospetiva e Inibitória exactamente equivalentes;
  //     DP_Itens = 0 → padrão de resposta invariante, o caso em que a coluna mais
  //                    importa, por sinalizar protocolo de validade duvidosa.
  //   (x||'') faria desaparecer os três, isto é, transformaria resultados válidos em
  //   células vazias indistinguíveis de protocolo por preencher.
  // ⚠ Escalas não cotáveis (omissões acima do limite) chegam como string vazia e são
  //   gravadas como tal — nunca como zero, que seria uma pontuação impossível.
  if (abaNome === 'EII27' || abaNome === 'EII12') {
    var _eV = function (a, b) {
      if (a !== undefined && a !== null) return a;
      if (b !== undefined && b !== null) return b;
      return '';
    };
    var _eResp = (typeof d.Respostas === 'string') ? d.Respostas
               : JSON.stringify(d.respostas || d.Respostas || d.answers || {});
    var _eBase = [
      hoje,
      d.patientCode || d.codigo || d.Código || cod || '',
      d.NomeUtente || d.nomeUtente || d.nomeCrianca || d.NomeCriança || nome || '',
      d.NomeInformante || d.nome_informante || d.nomeInformante || '',
      d.Informante || d.informante || '',
      d.Forma || d.forma || '',
      _eV(d.Idade, d.idade),
      d.Contexto || d.contexto || '',
      d.Versao || d.versao || ''
    ];
    var _eEsc = (abaNome === 'EII27')
      ? ['EII27_TOTAL', 'EII27_F1', 'EII27_F2', 'EII12_TOTAL', 'EII12_P', 'EII12_I']
      : ['EII12_TOTAL', 'EII12_P', 'EII12_I'];
    for (var _ei = 0; _ei < _eEsc.length; _ei++) {
      var _ek = _eEsc[_ei];
      _eBase.push(_eV(d[_ek], d[_ek.toLowerCase()]));
      _eBase.push(_eV(d[_ek + '_POMP'], d[_ek.toLowerCase() + '_pomp']));
      _eBase.push(_eV(d[_ek + '_Banda'], d[_ek.toLowerCase() + '_banda']));
    }
    _eBase.push(_eV(d.Delta_POMP, d.delta_pomp));
    _eBase.push(d.Polo || d.polo || '');
    _eBase.push(d.Banda_Delta || d.banda_delta || '');
    _eBase.push(_eV(d.DP_Itens, d.dp_itens));
    _eBase.push(d.Alerta || d.alerta || '');
    _eBase.push(_eResp);
    return _eBase;
  }

  return [hoje, JSON.stringify(d)];
}


// ── doGet ────────────────────────────────────────────────────

function doGet(e) {
  try {
    var params  = (e && e.parameter) ? e.parameter : {};

    // ── v112.0 · confirmação de entrega (DIVA-5) ────────────────────────
    // Ramo colocado ANTES de tudo o resto: devolve só {ok, respostasOk}.
    if (params.verificar === '1') return verificarEntrega_(e);

    var inst    = params.instrumento || params.sheet || 'todos';
    var filtCod = params.codigo || '';
    var resultado = {};
    if (inst === 'todos') {
      Object.keys(HEADERS).forEach(function(abaNome) {
        resultado[abaNome] = lerAba(abaNome, filtCod);
      });
    } else {
      var abaNome = ABA[inst] || inst;
      resultado = { rows: lerAba(abaNome, filtCod) };
    }
    return jsonResponse(resultado);
  } catch(err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}


// ── lerAba ───────────────────────────────────────────────────

function lerAba(abaNome, filtCod) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(abaNome);
  if (!sh || sh.getLastRow() < 2) return [];
  var data    = sh.getDataRange().getValues();
  var headers = data[0];
  var rows    = data.slice(1);

  // Tolerância de leitura (CBCL_618): linhas antigas gravadas com uma coluna a
  // mais (NomePreenche vazia na posição 8) ficaram com T_INT..Respostas
  // deslocados. Aqui endireitamos a linha EM MEMÓRIA, só para devolver ao
  // painel — a folha NÃO é alterada. Assinatura: T_INT (col H, índice 7) vazio
  // e coluna 21 (índice 20) com JSON de respostas.
  if (abaNome === 'CBCL_618') {
    rows = rows.map(function(row) {
      var h    = (row[7]  === undefined || row[7]  === null) ? '' : row[7].toString().trim();
      var extra= (row[20] === undefined || row[20] === null) ? '' : row[20].toString().trim();
      if (h === '' && /^\s*\{/.test(extra)) {
        return row.slice(0, 7).concat(row.slice(8)); // remove a célula fantasma
      }
      return row;
    });
  }

  return rows
    .map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      return obj;
    })
    .filter(function(obj) {
      if (!filtCod) return true;
      var cod = String(
        obj['Código Paciente'] || obj['Código'] ||
        obj['Codigo']          || obj['codigo'] || obj['patientCode'] || ''
      );
      return cod.toUpperCase() === filtCod.toUpperCase();
    });
}


// ── LIMPEZA DE DUPLICADOS — CBCL_618 ─────────────────────────
// Executar UMA vez a partir do editor do Apps Script (menu Executar).
// Segurança clínica:
//   • Remove APENAS linhas EXATAMENTE iguais (todas as células idênticas),
//     mantendo a última ocorrência.
//   • NÃO apaga "quase-duplicados" (mesmo Código+Data+PreenchidoPor mas com
//     valores diferentes) — apenas os LISTA, para decisão manual.
//   • NÃO apaga linhas com Respostas vazias/'{}' — apenas as LISTA.
// Devolve e regista (Logger) um relatório.
function limparDuplicadosCBCL() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CBCL_618');
  if (!sh) { Logger.log('Aba CBCL_618 inexistente.'); return 'Aba CBCL_618 inexistente.'; }
  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  if (lastRow < 3) { Logger.log('Nada a limpar.'); return 'Nada a limpar.'; }

  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var data    = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  var idxCod  = _colIndexByNames(headers, DEDUPE_ALIASES['Código']);
  var idxData = _colIndexByNames(headers, DEDUPE_ALIASES['Data']);
  var idxPre  = _colIndexByNames(headers, DEDUPE_ALIASES['PreenchidoPor']);
  var idxResp = _colIndexByNames(headers, ['Respostas', 'respostas', 'answers']);

  var seenExact = {};      // linha inteira → visto
  var keyRows   = {};      // chave lógica → [nºs de linha]
  var exactDel  = [];      // nºs de linha a apagar (duplicados exatos)
  var vazias    = [];      // nºs de linha com Respostas vazias

  // percorrer de baixo para cima → mantém a ÚLTIMA ocorrência exata
  for (var r = data.length - 1; r >= 0; r--) {
    var rowNum = r + 2;
    var full = data[r].map(_normKey).join('||');
    if (seenExact[full]) { exactDel.push(rowNum); } else { seenExact[full] = true; }

    var lk = [
      idxCod  >= 0 ? _normKey(data[r][idxCod])  : '',
      idxData >= 0 ? _normKey(data[r][idxData]) : '',
      idxPre  >= 0 ? _normKey(data[r][idxPre])  : ''
    ].join('||');
    (keyRows[lk] = keyRows[lk] || []).push(rowNum);

    if (idxResp >= 0) {
      var resp = _normKey(data[r][idxResp]);
      if (resp === '' || resp === '{}') vazias.push(rowNum);
    }
  }

  // apagar duplicados exatos (de baixo para cima)
  exactDel.sort(function(a, b) { return b - a; });
  exactDel.forEach(function(n) { sh.deleteRow(n); });

  // quase-duplicados: mesma chave lógica com mais de 1 linha AINDA presente
  // (recalcular contra as linhas que sobraram)
  var restantesLast = sh.getLastRow();
  var quaseDup = [];
  if (restantesLast >= 3) {
    var d2 = sh.getRange(2, 1, restantesLast - 1, lastCol).getValues();
    var mapa = {};
    for (var i = 0; i < d2.length; i++) {
      var lk2 = [
        idxCod  >= 0 ? _normKey(d2[i][idxCod])  : '',
        idxData >= 0 ? _normKey(d2[i][idxData]) : '',
        idxPre  >= 0 ? _normKey(d2[i][idxPre])  : ''
      ].join('||');
      (mapa[lk2] = mapa[lk2] || []).push(i + 2);
    }
    Object.keys(mapa).forEach(function(k) {
      if (mapa[k].length > 1) quaseDup.push(k.replace(/\|\|/g, ' · ') + '  → linhas ' + mapa[k].join(', '));
    });
  }

  var rel = [
    'LIMPEZA CBCL_618',
    '• Duplicados EXATOS removidos: ' + exactDel.length,
    '• Quase-duplicados (mesmo Código+Data+PreenchidoPor, valores diferentes — REVER MANUALMENTE): ' +
      (quaseDup.length ? '\n   - ' + quaseDup.join('\n   - ') : 'nenhum'),
    '• Linhas com Respostas vazias/{} (REVER MANUALMENTE): ' +
      (vazias.length ? vazias.sort(function(a,b){return a-b;}).join(', ') : 'nenhuma')
  ].join('\n');
  Logger.log(rel);
  return rel;
}


// ── REPARAÇÃO DE LINHAS DESALINHADAS — CBCL_618 ──────────────
// Corrige as linhas que foram escritas com 21 valores (com a coluna
// NomePreenche a mais) numa folha de 20 colunas, o que deslocou T_INT..Respostas
// uma coluna para a direita (deixando a coluna H/T_INT vazia e o JSON de
// Respostas na coluna U, a 21.ª).
//
// USO (correr do editor):
//   1.º  repararDesalinhadasCBCL(true)   → DRY-RUN: só relata, não altera nada.
//   2.º  repararDesalinhadasCBCL(false)  → aplica. Cria BACKUP da aba antes.
//
// Segurança:
//   • Faz backup completo da aba (CBCL_618_BACKUP_aaaammdd_hhmmss) antes de tocar.
//   • Só repara linhas com assinatura inequívoca (coluna U com JSON + coluna H
//     vazia). Qualquer linha ambígua é LISTADA e deixada intacta.
//   • Idempotente: uma 2.ª execução já não encontra nada para reparar.
function repararDesalinhadasCBCL(dryRun) {
  if (dryRun === undefined) dryRun = true; // por defeito NÃO altera
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CBCL_618');
  if (!sh) { var m0='Aba CBCL_618 inexistente.'; Logger.log(m0); return m0; }

  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 2) { var m1='Sem dados.'; Logger.log(m1); return m1; }

  var headers = sh.getRange(1, 1, 1, Math.max(lastCol, 20)).getValues()[0];
  // Proteção: confirmar schema esperado (20 col, Respostas na 20.ª)
  if (_normKey(headers[19]).toLowerCase() !== 'respostas') {
    var m2 = 'ABORTADO: a 20.ª coluna não é "Respostas" (é "' + _normKey(headers[19]) +
             '"). O schema da folha não corresponde ao esperado — reveja manualmente.';
    Logger.log(m2); return m2;
  }
  if (lastCol <= 20) {
    var m3 = 'Nenhuma linha desalinhada: não há conteúdo na coluna 21 (U). Nada a fazer.';
    Logger.log(m3); return m3;
  }

  var nCols = Math.max(lastCol, 21);
  var data  = sh.getRange(2, 1, lastRow - 1, nCols).getValues();

  var reparar   = [];  // {rowNum, nova} a aplicar
  var ambiguas  = [];  // linhas com conteúdo em U mas assinatura duvidosa

  for (var r = 0; r < data.length; r++) {
    var rowNum = r + 2;
    var linha  = data[r];
    var u      = _normKey(linha[20]);              // coluna U (21.ª)
    if (u === '') continue;                          // linha normal → ignora

    var hVazio    = _normKey(linha[7]) === '';       // H (T_INT) deve estar vazio
    var uEhJson   = /^\s*\{/.test(u);                // U deve ser JSON
    var semExtra  = nCols <= 21 || linha.slice(21).every(function(x){ return _normKey(x) === ''; });

    if (hVazio && uEhJson && semExtra) {
      // remover o índice 7 (NomePreenche='') e recompor 20 colunas + limpar U
      var nova = linha.slice(0, 7).concat(linha.slice(8, 21)); // 7 + 13 = 20
      // verificação pós: Respostas final tem de ser JSON
      if (/^\s*\{/.test(_normKey(nova[19]))) {
        reparar.push({ rowNum: rowNum, nova: nova });
      } else {
        ambiguas.push(rowNum + ' (pós-reparação sem JSON em Respostas)');
      }
    } else {
      var motivo = [];
      if (!hVazio)   motivo.push('H/T_INT não vazio');
      if (!uEhJson)  motivo.push('U não é JSON');
      if (!semExtra) motivo.push('há conteúdo além da coluna U');
      ambiguas.push(rowNum + ' (' + motivo.join('; ') + ')');
    }
  }

  var cabecalho = 'REPARAÇÃO CBCL_618' + (dryRun ? ' — SIMULAÇÃO (dry-run, nada alterado)' : ' — APLICADA');
  if (!reparar.length && !ambiguas.length) {
    var m4 = cabecalho + '\n• Nenhuma linha desalinhada encontrada.';
    Logger.log(m4); return m4;
  }

  if (!dryRun && reparar.length) {
    // BACKUP completo da aba antes de alterar
    var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    var bkp = sh.copyTo(ss);
    bkp.setName('CBCL_618_BACKUP_' + ts);
    // aplicar correções (reescreve 21 col: 20 corrigidas + '' para limpar U)
    reparar.forEach(function(item) {
      sh.getRange(item.rowNum, 1, 1, 21).setValues([ item.nova.concat(['']) ]);
    });
  }

  var rel = [
    cabecalho,
    '• Linhas desalinhadas ' + (dryRun ? 'detetadas' : 'reparadas') + ': ' + reparar.length +
      (reparar.length ? '  → linhas ' + reparar.map(function(x){return x.rowNum;}).join(', ') : ''),
    '• Linhas ambíguas (NÃO tocadas — rever à mão): ' +
      (ambiguas.length ? '\n   - ' + ambiguas.join('\n   - ') : 'nenhuma'),
    (dryRun
      ? '→ Simulação. Para aplicar: correr repararDesalinhadasCBCL(false).'
      : '→ Backup criado na aba CBCL_618_BACKUP_* (pode apagar depois de confirmar).')
  ].join('\n');
  Logger.log(rel);
  return rel;
}


// ─────────────────────────────────────────────────────────────
// v94 — MIGRAÇÃO: colunas de brutos na aba YSR_1118
//
// getOrCreateSheet() só escreve o cabeçalho quando a aba está VAZIA. Numa aba
// que já tem dados, alterar HEADERS não cria coluna nenhuma: as linhas novas
// passariam a ser escritas para além do cabeçalho, com as células de topo em
// branco. Esta função acrescenta os nomes em falta ao fim do cabeçalho real.
//
// Só acrescenta ao FIM e só o que faltar — nunca reordena nem apaga nada, pelo
// que as linhas históricas ficam alinhadas exactamente onde estão.
//
// Correr primeiro em simulação:  acrescentarColunasRawYSR(true)
// Depois, para aplicar:          acrescentarColunasRawYSR(false)
// ─────────────────────────────────────────────────────────────
function acrescentarColunasRawYSR(dryRun) {
  if (dryRun === undefined) dryRun = true;

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('YSR_1118');
  if (!sh) { var m0 = 'Aba YSR_1118 inexistente — nada a fazer.'; Logger.log(m0); return m0; }

  var novas = ['Raw_INT', 'Raw_EXT', 'Raw_TOT',
               'Raw_I', 'Raw_II', 'Raw_III', 'Raw_IV',
               'Raw_V', 'Raw_VI', 'Raw_VII', 'Raw_VIII', 'Raw_Outros'];

  var lastCol = Math.max(sh.getLastColumn(), 1);
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];

  var emFalta = novas.filter(function(n) { return headers.indexOf(n) === -1; });
  var jaLa    = novas.filter(function(n) { return headers.indexOf(n) !== -1; });

  var rel = [
    'YSR_1118 — colunas de brutos' + (dryRun ? '  [SIMULAÇÃO]' : '  [APLICADO]'),
    '• Cabeçalho actual: ' + lastCol + ' colunas',
    '• Já presentes: ' + (jaLa.length ? jaLa.join(', ') : 'nenhuma'),
    '• A acrescentar: ' + (emFalta.length ? emFalta.join(', ') : 'nenhuma')
  ];

  if (emFalta.length && !dryRun) {
    sh.getRange(1, lastCol + 1, 1, emFalta.length)
      .setValues([emFalta])
      .setBackground('#3B5A7A')
      .setFontColor('white')
      .setFontWeight('bold');
    rel.push('• Escritas nas colunas ' + (lastCol + 1) + '–' + (lastCol + emFalta.length));
    rel.push('→ As linhas históricas ficam com estas células vazias: os brutos delas');
    rel.push('  recalculam-se a partir da coluna Respostas, que é a fonte de verdade.');
  } else if (emFalta.length) {
    rel.push('→ Simulação. Para aplicar: correr acrescentarColunasRawYSR(false).');
  } else {
    rel.push('→ Nada a fazer.');
  }

  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}


// ─────────────────────────────────────────────────────────────
// v95 — MIGRAÇÃO: colunas de brutos na aba CBCL_618
// Mesmo padrão do v94 (YSR): getOrCreateSheet só escreve cabeçalhos em abas
// vazias, pelo que a aba existente precisa desta migração. Só acrescenta ao
// FIM e só o que faltar — nunca reordena nem apaga.
// Correr primeiro:  acrescentarColunasRawCBCL(true)   [simulação]
// Depois:           acrescentarColunasRawCBCL(false)  [aplica]
// ─────────────────────────────────────────────────────────────
function acrescentarColunasRawCBCL(dryRun) {
  if (dryRun === undefined) dryRun = true;

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CBCL_618');
  if (!sh) { var m0 = 'Aba CBCL_618 inexistente — nada a fazer.'; Logger.log(m0); return m0; }

  var novas = ['Raw_INT', 'Raw_EXT',
               'Raw_I', 'Raw_II', 'Raw_III', 'Raw_IV',
               'Raw_V', 'Raw_VI', 'Raw_VII', 'Raw_VIII'];

  var lastCol = Math.max(sh.getLastColumn(), 1);
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];

  var emFalta = novas.filter(function(n) { return headers.indexOf(n) === -1; });
  var jaLa    = novas.filter(function(n) { return headers.indexOf(n) !== -1; });

  var rel = [
    'CBCL_618 — colunas de brutos' + (dryRun ? '  [SIMULAÇÃO]' : '  [APLICADO]'),
    '• Cabeçalho actual: ' + lastCol + ' colunas',
    '• Já presentes: ' + (jaLa.length ? jaLa.join(', ') : 'nenhuma'),
    '• A acrescentar: ' + (emFalta.length ? emFalta.join(', ') : 'nenhuma')
  ];

  if (emFalta.length && !dryRun) {
    sh.getRange(1, lastCol + 1, 1, emFalta.length)
      .setValues([emFalta])
      .setBackground('#3B5A7A')
      .setFontColor('white')
      .setFontWeight('bold');
    rel.push('• Escritas nas colunas ' + (lastCol + 1) + '–' + (lastCol + emFalta.length));
    rel.push('→ Linhas históricas ficam com estas células vazias; os brutos delas');
    rel.push('  recalculam-se sempre a partir da coluna Respostas (fonte de verdade).');
  } else if (emFalta.length) {
    rel.push('→ Simulação. Para aplicar: correr acrescentarColunasRawCBCL(false).');
  } else {
    rel.push('→ Nada a fazer.');
  }

  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}


// ─────────────────────────────────────────────────────────────
// v96 — MIGRAÇÃO: colunas de brutos na aba TRF_618
// Mesmo padrão do v94/v95: getOrCreateSheet só escreve cabeçalhos em abas
// vazias, pelo que a aba existente precisa desta migração. Só acrescenta ao
// FIM e só o que faltar — nunca reordena nem apaga.
// Correr primeiro:  acrescentarColunasRawTRF(true)   [simulação]
// Depois:           acrescentarColunasRawTRF(false)  [aplica]
// ─────────────────────────────────────────────────────────────
function acrescentarColunasRawTRF(dryRun) {
  if (dryRun === undefined) dryRun = true;

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TRF_618');
  if (!sh) { var m0 = 'Aba TRF_618 inexistente — nada a fazer.'; Logger.log(m0); return m0; }

  var novas = ['Raw_INT', 'Raw_EXT', 'Raw_TOT',
               'Raw_I', 'Raw_II', 'Raw_III', 'Raw_IV',
               'Raw_V', 'Raw_VI', 'Raw_VII', 'Raw_VIII',
               'Raw_Desatencao', 'Raw_HiperImp'];

  var lastCol = Math.max(sh.getLastColumn(), 1);
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];

  var emFalta = novas.filter(function(n) { return headers.indexOf(n) === -1; });
  var jaLa    = novas.filter(function(n) { return headers.indexOf(n) !== -1; });

  var rel = [
    'TRF_618 — colunas de brutos' + (dryRun ? '  [SIMULAÇÃO]' : '  [APLICADO]'),
    '• Cabeçalho actual: ' + lastCol + ' colunas',
    '• Já presentes: ' + (jaLa.length ? jaLa.join(', ') : 'nenhuma'),
    '• A acrescentar: ' + (emFalta.length ? emFalta.join(', ') : 'nenhuma')
  ];

  if (emFalta.length && !dryRun) {
    sh.getRange(1, lastCol + 1, 1, emFalta.length)
      .setValues([emFalta])
      .setBackground('#3B5A7A')
      .setFontColor('white')
      .setFontWeight('bold');
    rel.push('• Escritas nas colunas ' + (lastCol + 1) + '–' + (lastCol + emFalta.length));
    rel.push('→ Linhas históricas ficam com estas células vazias; os brutos delas');
    rel.push('  recalculam-se sempre a partir da coluna Respostas (fonte de verdade).');
    rel.push('⚠ Lembrete: os T_* históricos desta aba vieram de normas fabricadas — não usar.');
  } else if (emFalta.length) {
    rel.push('→ Simulação. Para aplicar: correr acrescentarColunasRawTRF(false).');
  } else {
    rel.push('→ Nada a fazer.');
  }

  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}


// ═════════════════════════════════════════════════════════════
// v97 — REPARAÇÃO DO CABEÇALHO CONNERS3P_FULL
// ─────────────────────────────────────────────────────────────
// Problema: a aba CONNERS3P_FULL foi criada com o cabeçalho da
// versão Professor (Raw_LPEF/T_LPEF combinados = 25 colunas com
// nome), mas o buildRow da versão Pais escreve 27 valores
// (Raw_LP/Raw_EF e T_LP/T_EF separados). Resultado: os DADOS
// estão fisicamente nas colunas certas (ordem do buildRow), mas
// os NOMES do cabeçalho estão desfasados a partir da coluna I —
// o doGet devolve chaves erradas (ex.: "T_IN":16) e o JSON de
// Respostas fica em colunas sem nome (Z/AA).
// Correcção: reescrever APENAS a linha 1 com os 27 nomes na
// ordem do buildRow. Nenhuma célula de dados é alterada.
// Ordem de execução no editor do Apps Script:
//   1) auditarConners3PFull()   — dry-run, só relatório
//   2) repararCabecalhoConners3PFull() — backup + reescreve linha 1
// ═════════════════════════════════════════════════════════════

var CONNERS3P_FULL_HEADER_V97 = [
  'Data', 'Codigo', 'NomeCrianca', 'NomeInformante', 'Relação', 'Idade',
  'Raw_IN', 'Raw_HI', 'Raw_LP', 'Raw_EF', 'Raw_AG', 'Raw_PR',
  'Raw_DSMI', 'Raw_DSMH', 'Raw_CD', 'Raw_ODD',
  'T_IN', 'T_HI', 'T_LP', 'T_EF', 'T_AG', 'T_PR',
  'T_DSMI', 'T_DSMH', 'T_CD', 'T_ODD', 'Respostas'
];

// 1) DRY-RUN — não escreve nada; devolve e regista um relatório.
function auditarConners3PFull() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONNERS3P_FULL');
  if (!sh) { Logger.log('Aba CONNERS3P_FULL inexistente.'); return 'Aba inexistente.'; }
  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var rel = [];
  rel.push('Cabeçalho actual (' + lastCol + ' colunas): ' + headers.join(' | '));
  rel.push('Cabeçalho v97 alvo (27 colunas): ' + CONNERS3P_FULL_HEADER_V97.join(' | '));
  rel.push('');
  if (lastRow >= 2) {
    var data = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    data.forEach(function(row, i) {
      var n = row.length;
      while (n > 0 && (row[n-1] === '' || row[n-1] === null)) n--;
      var jsonPos = -1;
      for (var c = 0; c < row.length; c++) {
        if (typeof row[c] === 'string' && /^\s*\[/.test(row[c])) jsonPos = c;
      }
      var estado = (n === 27 && jsonPos === 26) ? 'OK após reparação (27 valores, JSON na col. 27)'
                 : 'ANÓMALA — ' + n + ' valores, JSON na col. ' + (jsonPos + 1) +
                   ' → rever/eliminar manualmente (provável registo de teste)';
      rel.push('Linha ' + (i + 2) + ' [' + row[1] + ']: ' + estado);
    });
  }
  rel.push('');
  rel.push('A reparação reescreve APENAS a linha 1. Nenhum dado é movido ou alterado.');
  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}

// 2) REPARAÇÃO — cria cópia de segurança da aba e reescreve a linha 1.
function repararCabecalhoConners3PFull() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CONNERS3P_FULL');
  if (!sh) { Logger.log('Aba CONNERS3P_FULL inexistente.'); return 'Aba inexistente.'; }

  // Cópia de segurança integral da aba (dados + cabeçalho antigo)
  var backupName = 'CONNERS3P_FULL_BACKUP_' +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
  if (!ss.getSheetByName(backupName)) {
    sh.copyTo(ss).setName(backupName);
  }

  // Garantir largura suficiente e reescrever SÓ a linha 1
  var H = CONNERS3P_FULL_HEADER_V97;
  if (sh.getMaxColumns() < H.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), H.length - sh.getMaxColumns());
  }
  // Limpar restos de cabeçalho antigo para lá da 27.ª coluna, se existirem
  if (sh.getLastColumn() > H.length) {
    sh.getRange(1, H.length + 1, 1, sh.getLastColumn() - H.length).clearContent();
  }
  sh.getRange(1, 1, 1, H.length).setValues([H]);

  var msg = 'Cabeçalho CONNERS3P_FULL reescrito (27 colunas). Backup: ' + backupName +
            '. Dados não alterados. Executar auditarConners3PFull() para confirmar.';
  Logger.log(msg);
  return msg;
}


// ═════════════════════════════════════════════════════════════
// v100 — RECÁLCULO DAS COTAÇÕES CONNERS3PS / CONNERS3TS
// ─────────────────────────────────────────────────────────────
// Problema: até 25/07/2026 os ficheiros HTML Conners3_Pais_Short
// e Conners3_Professores_Short gravaram T-scores calculados a
// partir de tabelas normativas incorrectas (67% e 70% das
// células divergentes face à BASE_TÉCNICA do Excel de origem).
// Os brutos também estavam subestimados nas escalas com itens em
// falta, porque a soma ignorava os omissos em vez de devolver N/D.
// A coluna Respostas guarda o JSON das respostas em bruto, pelo
// que todas as linhas afectadas são recuperáveis sem perda.
//
// Correcção: recalcular Raw_* e T_* a partir de Respostas + Idade,
// com as tabelas e regras da folha COTAÇÃO do Excel:
//   · item invertido → 3 - resposta
//   · escala com qualquer item em falta → N/D (célula vazia)
//   · T = tabela[MIN(bruto, max)][coluna da idade]
//   · idade >= 17 usa a coluna 17/18a · idade < 6 usa a de 6a
// NENHUMA outra coluna é tocada (Data, Codigo, nomes, Relação,
// Idade e Respostas ficam exactamente como estão).
//
// Ordem de execução no editor do Apps Script:
//   1) auditarCotacoesConnersShort()            — dry-run, só relatório
//   2) repararCotacoesConnersShort('CONFIRMO')  — backup + reescreve
// ═════════════════════════════════════════════════════════════

var CONNERS_SHORT_V100 = {
  'CONNERS3PS': {
    nItens: 45,
    inv: [2, 12, 16, 22, 31, 33, 37, 40, 42],   // itens invertidos (1-based): valor cotado = 3 - resposta
    escalas: [
      { code: 'IN', itens: [17, 27, 30, 34, 41], max: 15,
        t: [[40,40,40,40,40,40,40,40,40,40,40,40],
            [40,40,40,40,43,43,43,44,44,44,44,44],
            [40,40,44,44,48,47,47,48,48,48,48,48],
            [47,47,49,49,52,51,51,53,52,52,52,52],
            [51,51,53,53,57,56,56,57,57,57,57,57],
            [56,56,58,58,61,60,60,62,61,61,61,61],
            [61,61,63,63,66,65,65,66,65,65,65,65],
            [66,66,68,68,71,69,69,71,70,70,70,70],
            [71,71,72,72,75,74,74,75,74,74,74,74],
            [76,76,77,77,80,78,78,80,79,79,79,79],
            [80,80,82,82,85,83,83,84,83,83,83,83],
            [85,85,87,87,89,87,87,89,87,87,87,87],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'HI', itens: [3, 5, 7, 13, 24, 28], max: 18,
        t: [[40,40,40,40,40,40,40,40,40,40,40,40],
            [40,40,40,40,40,40,40,45,45,45,45,45],
            [40,40,40,40,40,47,47,50,50,50,50,50],
            [40,40,40,50,50,52,52,55,55,55,55,55],
            [40,52,52,55,54,57,57,60,60,60,60,60],
            [55,58,57,60,59,62,62,65,65,65,65,65],
            [61,64,63,66,64,67,67,70,70,70,70,70],
            [67,70,69,71,69,72,72,75,75,75,75,75],
            [73,76,74,77,75,77,77,80,80,80,80,80],
            [79,82,80,82,80,83,83,85,85,85,85,85],
            [85,87,86,87,85,88,88,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'LP', itens: [8, 10, 25, 36, 39], max: 15,
        t: [[40,40,40,40,40,40,40,40,40,40,40,40],
            [40,40,40,40,40,43,43,45,45,45,46,46],
            [40,40,40,45,45,49,49,51,50,50,51,51],
            [40,47,47,51,50,54,54,56,56,56,57,57],
            [51,53,52,57,56,60,59,62,61,61,62,62],
            [57,59,58,62,61,65,65,67,67,66,68,68],
            [63,65,64,68,67,71,70,73,72,72,73,73],
            [69,71,70,74,72,77,76,78,78,77,79,79],
            [75,77,76,80,78,82,81,84,83,83,84,84],
            [81,83,81,85,83,88,87,89,89,88,90,90],
            [87,89,87,90,89,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'EF', itens: [1, 15, 20, 32, 35], max: 15,
        t: [[40,40,40,40,40,40,40,40,40,40,40,40],
            [40,40,40,40,40,40,43,43,45,45,46,46],
            [40,40,40,40,45,45,48,48,51,50,51,51],
            [40,40,47,47,50,50,53,53,56,56,56,56],
            [51,51,53,53,56,55,59,59,61,61,62,62],
            [57,57,58,58,61,61,64,64,67,66,67,67],
            [63,62,64,64,67,66,70,69,72,72,73,73],
            [69,68,70,69,72,71,75,75,77,77,78,78],
            [75,74,75,75,78,77,80,80,83,82,83,83],
            [81,80,81,81,83,82,86,85,88,88,89,89],
            [87,85,87,86,89,88,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'AG', itens: [14, 19, 21, 23, 26], max: 15,
        t: [[44,44,44,44,44,44,44,44,44,44,44,44],
            [44,44,49,48,48,49,49,50,50,51,51,52],
            [53,52,54,53,52,54,53,55,54,55,55,57],
            [59,57,59,58,57,58,58,59,59,60,60,62],
            [65,63,64,63,62,63,63,64,64,65,65,67],
            [71,68,69,68,67,68,67,69,68,70,70,71],
            [90,74,75,73,72,73,72,74,73,74,74,76],
            [90,90,90,79,77,78,77,78,78,79,79,81],
            [90,90,90,90,82,83,82,83,83,84,84,86],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'PR', itens: [4, 6, 18, 38, 43], max: 15,
        t: [[44,44,44,44,44,44,44,44,44,44,44,44],
            [44,44,44,44,50,50,50,51,51,52,52,53],
            [44,44,54,53,56,56,55,57,56,58,58,59],
            [59,59,60,59,62,62,61,63,62,64,64,65],
            [65,65,66,65,68,68,67,69,68,70,70,71],
            [72,72,72,71,74,74,73,75,74,76,76,77],
            [78,78,78,77,80,80,79,81,80,82,82,83],
            [85,85,85,84,86,86,85,87,86,88,88,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
    ]
  },
  'CONNERS3TS': {
    nItens: 41,
    inv: [2, 4, 9, 13, 19, 23, 25, 31, 34],   // itens invertidos (1-based): valor cotado = 3 - resposta
    escalas: [
      { code: 'IN', itens: [3, 10, 26, 36, 39], max: 15,
        t: [[40,40,40,40,40,40,40,40,40,40,40,40],
            [40,40,40,40,40,40,44,44,45,45,46,46],
            [40,40,40,40,46,46,49,49,50,50,51,51],
            [40,40,48,48,51,51,54,54,56,55,56,56],
            [51,51,53,53,57,56,59,59,61,60,62,62],
            [57,57,59,59,62,61,64,64,66,65,67,67],
            [63,63,64,64,68,67,70,69,71,71,72,72],
            [69,68,70,70,73,72,75,74,77,76,77,77],
            [75,74,76,75,79,77,80,80,82,81,82,82],
            [81,80,81,81,84,83,85,85,87,86,88,88],
            [87,86,87,86,90,88,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'HI', itens: [1, 8, 22, 24, 30, 32], max: 18,
        t: [[40,40,40,40,40,40,40,40,40,40,40,40],
            [40,40,40,40,40,40,40,40,40,45,45,46],
            [40,40,40,40,40,40,40,47,47,50,50,51],
            [40,40,40,40,40,49,49,52,52,56,56,57],
            [40,40,40,51,51,54,54,58,57,61,61,62],
            [40,53,53,57,56,60,60,63,63,67,66,68],
            [56,59,59,63,62,66,65,69,68,72,72,73],
            [63,66,65,69,68,71,71,74,74,78,77,79],
            [69,72,72,75,74,77,76,80,79,83,83,84],
            [75,78,78,81,80,83,82,85,85,88,88,90],
            [82,85,84,87,85,88,88,90,90,90,90,90],
            [88,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'LPEF', itens: [14, 16, 18, 23, 28, 35], max: 18,
        t: [[40,40,40,40,40,40,40,40,40,40,40,40],
            [40,40,40,40,40,40,40,40,43,43,44,44],
            [40,40,40,40,40,40,45,45,47,47,48,48],
            [40,40,40,40,47,47,49,49,52,52,53,53],
            [40,40,49,49,51,51,54,53,56,56,57,57],
            [51,51,53,53,56,55,58,58,60,60,62,62],
            [56,56,58,58,61,60,63,62,65,65,66,66],
            [62,61,63,63,66,65,67,67,69,69,71,70],
            [67,66,68,68,70,69,72,71,74,73,75,75],
            [72,72,73,73,75,74,76,76,78,78,79,79],
            [78,77,78,78,80,79,81,80,83,82,84,84],
            [83,82,83,83,85,83,85,85,87,87,88,88],
            [88,87,88,88,89,88,90,89,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'AG', itens: [5, 7, 12, 15, 17], max: 15,
        t: [[44,44,44,44,44,44,44,44,44,44,44,44],
            [44,44,50,50,51,51,52,52,53,53,55,55],
            [54,54,56,56,57,57,58,58,59,59,61,61],
            [60,60,62,61,63,63,64,64,65,65,67,67],
            [67,66,68,67,69,68,70,70,72,71,73,73],
            [73,72,74,73,75,74,76,76,78,78,80,79],
            [79,78,80,79,81,80,82,82,84,84,86,86],
            [86,84,86,85,87,86,88,88,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
      { code: 'PR', itens: [11, 20, 27, 29, 37], max: 15,
        t: [[44,44,44,44,44,44,44,44,44,44,44,44],
            [44,44,44,44,44,44,44,55,55,56,56,57],
            [44,44,44,44,44,59,59,61,61,63,62,64],
            [44,44,44,63,63,65,65,68,67,69,69,71],
            [44,67,67,69,69,72,71,74,74,76,75,77],
            [72,74,73,76,75,78,77,81,80,82,82,84],
            [79,81,80,82,82,85,84,87,87,89,88,90],
            [85,88,87,89,88,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90],
            [90,90,90,90,90,90,90,90,90,90,90,90]] },
    ]
  },
};

// Coluna da tabela normativa correspondente à idade (0-based, 6a..17/18a).
function conners100_colIdade(idade) {
  var n = Number(idade);
  if (!isFinite(n) || n <= 0) return -1;
  if (n >= 17) return 11;
  if (n >= 6)  return Math.floor(n) - 6;
  return 0;
}

// Cotação de uma linha. Devolve { scores: {}, tscores: {} } com null onde N/D.
function conners100_cotar(def, resp, idade) {
  var scores = {}, tscores = {};
  var col = conners100_colIdade(idade);
  for (var i = 0; i < def.escalas.length; i++) {
    var e = def.escalas[i], raw = 0, completo = true;
    for (var j = 0; j < e.itens.length; j++) {
      var pos = e.itens[j] - 1;                 // itens são 1-based
      var r = (resp && resp[pos] !== undefined) ? resp[pos] : null;
      if (r === null || r === '' || isNaN(Number(r))) { completo = false; break; }
      raw += (def.inv.indexOf(e.itens[j]) !== -1) ? (3 - Number(r)) : Number(r);
    }
    if (!completo) { scores[e.code] = null; tscores[e.code] = null; continue; }
    scores[e.code] = raw;
    if (col < 0) { tscores[e.code] = null; continue; }
    var linha = e.t[Math.min(raw, e.max)];
    tscores[e.code] = (linha === undefined) ? null : linha[col];
  }
  return { scores: scores, tscores: tscores };
}

// Percorre uma aba e devolve o plano de alterações (sem escrever nada).
function conners100_analisar(abaNome) {
  var def = CONNERS_SHORT_V100[abaNome];
  var sh  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(abaNome);
  if (!def) return { erro: 'Instrumento desconhecido: ' + abaNome };
  if (!sh)  return { erro: 'Aba inexistente: ' + abaNome };
  if (sh.getLastRow() < 2) return { aba: abaNome, linhas: [], nCol: 0, semDados: true };

  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  for (var c = 0; c < headers.length; c++) idx[String(headers[c]).trim()] = c;

  var faltam = [];
  ['Idade', 'Respostas'].forEach(function(h) { if (idx[h] === undefined) faltam.push(h); });
  for (var k = 0; k < def.escalas.length; k++) {
    if (idx['Raw_' + def.escalas[k].code] === undefined) faltam.push('Raw_' + def.escalas[k].code);
    if (idx['T_'   + def.escalas[k].code] === undefined) faltam.push('T_'   + def.escalas[k].code);
  }
  if (faltam.length) return { erro: 'Aba ' + abaNome + ' sem as colunas: ' + faltam.join(', ') };

  var dados = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var linhas = [];
  for (var r = 0; r < dados.length; r++) {
    var row = dados[r];
    var reg = { linha: r + 2, codigo: row[idx['Codigo']], estado: '', alteracoes: [] };

    var bruto = row[idx['Respostas']];
    var resp = null;
    if (typeof bruto === 'string' && bruto.trim()) {
      try { var p = JSON.parse(bruto); if (Object.prototype.toString.call(p) === '[object Array]') resp = p; } catch (e) {}
    }
    if (!resp) { reg.estado = 'sem respostas em bruto — inalterada'; linhas.push(reg); continue; }
    if (resp.length !== def.nItens) {
      reg.estado = 'Respostas com ' + resp.length + ' valores (esperado ' + def.nItens + ') — inalterada';
      linhas.push(reg); continue;
    }

    var idade = row[idx['Idade']];
    var cot = conners100_cotar(def, resp, idade);
    for (var s = 0; s < def.escalas.length; s++) {
      var code = def.escalas[s].code;
      [['Raw_' + code, cot.scores[code]], ['T_' + code, cot.tscores[code]]].forEach(function(par) {
        var col = idx[par[0]];
        var antes = row[col];
        var depois = (par[1] === null) ? '' : par[1];
        if (String(antes) !== String(depois)) {
          reg.alteracoes.push({ col: col + 1, nome: par[0], antes: antes, depois: depois });
        }
      });
    }
    reg.estado = reg.alteracoes.length ? (reg.alteracoes.length + ' célula(s) a corrigir')
                                       : 'já correcta';
    if (conners100_colIdade(idade) < 0) reg.estado += ' · idade omissa/inválida → T fica vazio';
    linhas.push(reg);
  }
  return { aba: abaNome, linhas: linhas, idx: idx, lastCol: lastCol };
}

// 1) DRY-RUN — não escreve nada; devolve e regista um relatório.
function auditarCotacoesConnersShort() {
  var rel = [];
  rel.push('AUDITORIA v100 — recálculo das cotações Conners 3 Short');
  rel.push('Fonte das normas: BASE_TÉCNICA do Excel (Combined Gender, MHS Inc. © 2008/2009)');
  rel.push('');
  var totalCel = 0, totalLin = 0;

  Object.keys(CONNERS_SHORT_V100).forEach(function(aba) {
    var res = conners100_analisar(aba);
    rel.push('───────────── ' + aba);
    if (res.erro)     { rel.push('  ' + res.erro); rel.push(''); return; }
    if (res.semDados) { rel.push('  Sem linhas de dados.'); rel.push(''); return; }

    var comAlt = 0, cel = 0;
    res.linhas.forEach(function(l) {
      if (l.alteracoes.length) { comAlt++; cel += l.alteracoes.length; }
    });
    totalLin += comAlt; totalCel += cel;
    rel.push('  ' + res.linhas.length + ' linha(s) · ' + comAlt + ' a corrigir · ' + cel + ' célula(s)');
    res.linhas.forEach(function(l) {
      rel.push('   linha ' + l.linha + ' [' + l.codigo + ']: ' + l.estado);
      l.alteracoes.forEach(function(a) {
        rel.push('        ' + a.nome + ': ' + (a.antes === '' ? '(vazio)' : a.antes) +
                 ' → ' + (a.depois === '' ? '(vazio)' : a.depois));
      });
    });
    rel.push('');
  });

  rel.push('TOTAL: ' + totalLin + ' linha(s), ' + totalCel + ' célula(s) a corrigir.');
  rel.push('');
  rel.push('Só as colunas Raw_* e T_* são reescritas. Data, Codigo, nomes, Relação,');
  rel.push('Idade e Respostas ficam intactas.');
  rel.push('→ Simulação. Para aplicar: repararCotacoesConnersShort(\'CONFIRMO\')');
  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}

// 2) REPARAÇÃO — exige confirmação explícita; faz backup de cada aba antes.
function repararCotacoesConnersShort(confirmacao) {
  if (confirmacao !== 'CONFIRMO') {
    var aviso = 'Confirmação em falta. Correr primeiro auditarCotacoesConnersShort() e, ' +
                'depois de rever o relatório, repararCotacoesConnersShort(\'CONFIRMO\').';
    Logger.log(aviso);
    return aviso;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var carimbo = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
  var rel = ['REPARAÇÃO v100 — recálculo das cotações Conners 3 Short', ''];
  var totalCel = 0;

  Object.keys(CONNERS_SHORT_V100).forEach(function(aba) {
    var res = conners100_analisar(aba);
    rel.push('───────────── ' + aba);
    if (res.erro)     { rel.push('  ' + res.erro); rel.push(''); return; }
    if (res.semDados) { rel.push('  Sem linhas de dados.'); rel.push(''); return; }

    var porFazer = res.linhas.filter(function(l) { return l.alteracoes.length; });
    if (!porFazer.length) { rel.push('  Nada a corrigir.'); rel.push(''); return; }

    var sh = ss.getSheetByName(aba);
    var backupName = aba + '_BACKUP_' + carimbo;
    if (!ss.getSheetByName(backupName)) sh.copyTo(ss).setName(backupName);
    rel.push('  Backup: ' + backupName);

    var cel = 0;
    porFazer.forEach(function(l) {
      l.alteracoes.forEach(function(a) {
        sh.getRange(l.linha, a.col).setValue(a.depois);
        cel++;
      });
    });
    totalCel += cel;
    rel.push('  ' + porFazer.length + ' linha(s) corrigida(s) · ' + cel + ' célula(s) reescrita(s).');
    rel.push('');
  });

  rel.push('TOTAL: ' + totalCel + ' célula(s) reescrita(s).');
  rel.push('Correr auditarCotacoesConnersShort() para confirmar que já não há divergências.');
  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}


// ═════════════════════════════════════════════════════════════
// v101 — REPARAÇÃO DO CABEÇALHO CONNERS3PS
// ─────────────────────────────────────────────────────────────
// Problema: a aba CONNERS3PS foi criada com o cabeçalho da
// versão Professor (Raw_LPEF/T_LPEF combinados = 17 colunas com
// nome), mas o buildRow da versão Pais escreve 19 valores
// (Raw_LP/Raw_EF e T_LP/T_EF separados). Resultado: os DADOS
// estão fisicamente nas colunas certas (ordem do buildRow), mas
// os NOMES do cabeçalho estão desfasados a partir da coluna I —
// o que está sob "Raw_AG" é na verdade Raw_EF, o que está sob
// "Raw_PR" é Raw_AG, e o Raw_PR cai sob "T_IN" (foi por isso que
// apareceram T-scores de 2 e 4, impossíveis numa escala T).
// As colunas 18 e 19 ficam sem nome.
// É o mesmo defeito que a v97 corrigiu no CONNERS3P_FULL.
// Correcção: reescrever APENAS a linha 1 com os 19 nomes na
// ordem do buildRow. Nenhuma célula de dados é alterada.
// Ordem de execução no editor do Apps Script:
//   1) auditarConners3PS()            — dry-run, só relatório
//   2) repararCabecalhoConners3PS()   — backup + reescreve linha 1
//   3) auditarConners3PS()            — confirmar
// ═════════════════════════════════════════════════════════════

var CONNERS3PS_HEADER_V101 = [
  'Data', 'Codigo', 'NomeCrianca', 'NomeInformante', 'Relação', 'Idade',
  'Raw_IN', 'Raw_HI', 'Raw_LP', 'Raw_EF', 'Raw_AG', 'Raw_PR',
  'T_IN', 'T_HI', 'T_LP', 'T_EF', 'T_AG', 'T_PR', 'Respostas'
];

// 1) DRY-RUN — não escreve nada; devolve e regista um relatório.
function auditarConners3PS() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONNERS3PS');
  if (!sh) { Logger.log('Aba CONNERS3PS inexistente.'); return 'Aba inexistente.'; }
  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var H = CONNERS3PS_HEADER_V101;
  var rel = [];
  rel.push('Cabeçalho actual (' + lastCol + ' colunas): ' + headers.join(' | '));
  rel.push('Cabeçalho v101 alvo (' + H.length + ' colunas): ' + H.join(' | '));
  rel.push('');

  var iguais = (headers.length === H.length);
  if (iguais) {
    for (var k = 0; k < H.length; k++) {
      if (String(headers[k]).trim() !== H[k]) { iguais = false; break; }
    }
  }
  rel.push(iguais ? 'Cabeçalho JÁ CORRECTO — reparação desnecessária.'
                  : 'Cabeçalho DESFASADO — reparação necessária.');
  rel.push('');

  if (lastRow >= 2) {
    var data = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    data.forEach(function(row, i) {
      var n = row.length;
      while (n > 0 && (row[n-1] === '' || row[n-1] === null)) n--;
      var jsonPos = -1;
      for (var c = 0; c < row.length; c++) {
        if (typeof row[c] === 'string' && /^\s*\[/.test(row[c])) jsonPos = c;
      }
      var estado = (n === H.length && jsonPos === H.length - 1)
        ? 'OK após reparação (' + H.length + ' valores, JSON na col. ' + H.length + ')'
        : 'ANÓMALA — ' + n + ' valores, JSON na col. ' + (jsonPos + 1) +
          ' → escrita por outra versão do buildRow; rever manualmente antes de usar';
      rel.push('Linha ' + (i + 2) + ' [' + row[1] + ']: ' + estado);
    });
  } else {
    rel.push('Sem linhas de dados.');
  }

  rel.push('');
  rel.push('A reparação reescreve APENAS a linha 1. Nenhum dado é movido ou alterado.');
  rel.push('Nota: os T-scores gravados nestas linhas provêm de tabelas normativas');
  rel.push('não validadas e não devem ser usados, mesmo depois de realinhados os nomes.');
  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}

// 2) REPARAÇÃO — cria cópia de segurança da aba e reescreve a linha 1.
function repararCabecalhoConners3PS() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CONNERS3PS');
  if (!sh) { Logger.log('Aba CONNERS3PS inexistente.'); return 'Aba inexistente.'; }

  // Cópia de segurança integral da aba (dados + cabeçalho antigo)
  var backupName = 'CONNERS3PS_BACKUP_' +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
  if (!ss.getSheetByName(backupName)) {
    sh.copyTo(ss).setName(backupName);
  }

  // Garantir largura suficiente e reescrever SÓ a linha 1
  var H = CONNERS3PS_HEADER_V101;
  if (sh.getMaxColumns() < H.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), H.length - sh.getMaxColumns());
  }
  // Limpar restos de cabeçalho antigo para lá da 19.ª coluna, se existirem
  if (sh.getLastColumn() > H.length) {
    sh.getRange(1, H.length + 1, 1, sh.getLastColumn() - H.length).clearContent();
  }
  sh.getRange(1, 1, 1, H.length).setValues([H]);

  var msg = 'Cabeçalho CONNERS3PS reescrito (' + H.length + ' colunas). Backup: ' +
            backupName + '. Dados não alterados. Executar auditarConners3PS() para confirmar.';
  Logger.log(msg);
  return msg;
}


// ═════════════════════════════════════════════════════════════


// ═════════════════════════════════════════════════════════════
// v102 — RAW SIM, T NÃO
// ─────────────────────────────────────────────────────────────
// Achado de 26/07/2026: as tabelas t[] embutidas em
// CONNERS_SHORT_V100 são as mesmas da BASE_TÉCNICA do Excel, e
// essa BASE_TÉCNICA não foi transcrita do manual — é interpolação
// linear entre T=40 e T=90 (na escala IN, aos 6 anos: 40, 40, 40,
// 47, 51, 56, 61, 66, 71, 76, 80, 85, 90 — incrementos de 4 e 5
// ao longo de toda a coluna). O mesmo padrão está em todas as
// escalas e em todas as idades.
//
// Consequência: repararCotacoesConnersShort() corrigia os brutos
// (isso está certo e é recuperável a partir do JSON de Respostas)
// mas substituía T-scores errados por outros T-scores igualmente
// inválidos, apenas com outra proveniência. A partir de 26/07 os
// HTML deixaram de enviar T (NORMAS_VALIDADAS = false); reescrevê-
// los aqui anularia essa suspensão do lado do servidor.
//
// v102 faz o que a v100 fazia de útil e nada do resto:
//   · recalcula Raw_* a partir de Respostas + Idade
//   · escala com qualquer item em falta → N/D (célula vazia)
//   · item invertido → 3 - resposta (mapa de CONNERS_SHORT_V100)
//   · LIMPA todas as colunas T_*, sem as recalcular
//
// Ordem de execução no editor do Apps Script:
//   1) repararCabecalhoConners3PS()   — v101, primeiro (os nomes
//      das colunas têm de estar certos antes de escrever por nome)
//   2) auditarRawConnersShort()       — dry-run, só relatório
//   3) repararRawConnersShort('CONFIRMO')
// ═════════════════════════════════════════════════════════════

// Plano de alterações de uma aba: só Raw_* recalculado, T_* a vazio.
function conners102_plano(abaNome) {
  var def = CONNERS_SHORT_V100[abaNome];
  var sh  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(abaNome);
  if (!def) return { erro: 'Instrumento desconhecido: ' + abaNome };
  if (!sh)  return { erro: 'Aba inexistente: ' + abaNome };
  if (sh.getLastRow() < 2) return { aba: abaNome, linhas: [], semDados: true };

  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  for (var c = 0; c < head.length; c++) idx[String(head[c]).trim()] = c;

  var emFalta = [];
  ['Respostas', 'Idade', 'Codigo'].forEach(function(n) {
    if (idx[n] === undefined) emFalta.push(n);
  });
  def.escalas.forEach(function(e) {
    if (idx['Raw_' + e.code] === undefined) emFalta.push('Raw_' + e.code);
    if (idx['T_' + e.code]   === undefined) emFalta.push('T_' + e.code);
  });
  if (emFalta.length) {
    return { erro: 'Colunas em falta no cabeçalho: ' + emFalta.join(', ') +
                   '. Correr primeiro repararCabecalhoConners3PS() (v101).' };
  }

  var dados = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var linhas = [];
  for (var r = 0; r < dados.length; r++) {
    var row = dados[r];
    var reg = { linha: r + 2, codigo: row[idx['Codigo']], alteracoes: [], estado: '' };

    var resp = null;
    try { resp = JSON.parse(row[idx['Respostas']]); } catch (e) { resp = null; }
    if (!resp || !resp.length) {
      reg.estado = 'sem JSON de Respostas — inalterada';
      linhas.push(reg); continue;
    }
    if (resp.length !== def.nItens) {
      reg.estado = 'Respostas com ' + resp.length + ' valores (esperado ' + def.nItens +
                   ') — formato de outra versão; inalterada';
      linhas.push(reg); continue;
    }

    var cot = conners102_cotarRaw(def, resp);
    def.escalas.forEach(function(e) {
      var cRaw = idx['Raw_' + e.code], cT = idx['T_' + e.code];
      var depoisRaw = (cot.scores[e.code] === null) ? '' : cot.scores[e.code];
      if (String(row[cRaw]) !== String(depoisRaw)) {
        reg.alteracoes.push({ col: cRaw + 1, nome: 'Raw_' + e.code,
                              antes: row[cRaw], depois: depoisRaw });
      }
      if (String(row[cT]) !== '') {
        reg.alteracoes.push({ col: cT + 1, nome: 'T_' + e.code,
                              antes: row[cT], depois: '' });
      }
    });
    reg.estado = reg.alteracoes.length ? (reg.alteracoes.length + ' célula(s) a corrigir')
                                       : 'já correcta';
    linhas.push(reg);
  }
  return { aba: abaNome, linhas: linhas };
}

// Cotação dos brutos apenas. Não toca em tabelas normativas.
function conners102_cotarRaw(def, resp) {
  var scores = {};
  for (var i = 0; i < def.escalas.length; i++) {
    var e = def.escalas[i], raw = 0, completo = true;
    for (var j = 0; j < e.itens.length; j++) {
      var pos = e.itens[j] - 1;                 // itens são 1-based
      var r = (resp && resp[pos] !== undefined) ? resp[pos] : null;
      if (r === null || r === '' || isNaN(Number(r))) { completo = false; break; }
      raw += (def.inv.indexOf(e.itens[j]) !== -1) ? (3 - Number(r)) : Number(r);
    }
    scores[e.code] = completo ? raw : null;
  }
  return { scores: scores };
}

// 1) DRY-RUN — não escreve nada.
function auditarRawConnersShort() {
  var rel = [];
  rel.push('AUDITORIA v102 — recálculo dos brutos Conners 3 Short');
  rel.push('Os T-scores NÃO são recalculados: as tabelas disponíveis não foram');
  rel.push('validadas contra o manual. As colunas T_* passam a vazio.');
  rel.push('');
  var totalCel = 0, totalLin = 0;

  Object.keys(CONNERS_SHORT_V100).forEach(function(aba) {
    var res = conners102_plano(aba);
    rel.push('───────────── ' + aba);
    if (res.erro)     { rel.push('  ' + res.erro); rel.push(''); return; }
    if (res.semDados) { rel.push('  Sem linhas de dados.'); rel.push(''); return; }

    var comAlt = 0, cel = 0;
    res.linhas.forEach(function(l) {
      if (l.alteracoes.length) { comAlt++; cel += l.alteracoes.length; }
    });
    totalLin += comAlt; totalCel += cel;
    rel.push('  ' + res.linhas.length + ' linha(s) · ' + comAlt + ' a corrigir · ' + cel + ' célula(s)');
    res.linhas.forEach(function(l) {
      rel.push('   linha ' + l.linha + ' [' + l.codigo + ']: ' + l.estado);
      l.alteracoes.forEach(function(a) {
        rel.push('        ' + a.nome + ': ' + (a.antes === '' ? '(vazio)' : a.antes) +
                 ' → ' + (a.depois === '' ? '(vazio)' : a.depois));
      });
    });
    rel.push('');
  });

  rel.push('TOTAL: ' + totalLin + ' linha(s), ' + totalCel + ' célula(s) a corrigir.');
  rel.push('Só as colunas Raw_* e T_* são tocadas. Data, Codigo, nomes, Relação,');
  rel.push('Idade e Respostas ficam intactas.');
  rel.push('→ Simulação. Para aplicar: repararRawConnersShort(\'CONFIRMO\')');
  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}

// 2) REPARAÇÃO — exige confirmação explícita; backup de cada aba antes.
function repararRawConnersShort(confirmacao) {
  if (confirmacao !== 'CONFIRMO') {
    var aviso = 'Confirmação em falta. Correr primeiro auditarRawConnersShort() e, ' +
                'depois de rever o relatório, repararRawConnersShort(\'CONFIRMO\').';
    Logger.log(aviso);
    return aviso;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var carimbo = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
  var rel = ['REPARAÇÃO v102 — brutos recalculados, T-scores limpos', ''];
  var totalCel = 0;

  Object.keys(CONNERS_SHORT_V100).forEach(function(aba) {
    var res = conners102_plano(aba);
    rel.push('───────────── ' + aba);
    if (res.erro)     { rel.push('  ' + res.erro); rel.push(''); return; }
    if (res.semDados) { rel.push('  Sem linhas de dados.'); rel.push(''); return; }

    var porFazer = res.linhas.filter(function(l) { return l.alteracoes.length; });
    if (!porFazer.length) { rel.push('  Nada a corrigir.'); rel.push(''); return; }

    var sh = ss.getSheetByName(aba);
    var backupName = aba + '_BACKUP_' + carimbo;
    if (!ss.getSheetByName(backupName)) sh.copyTo(ss).setName(backupName);
    rel.push('  Backup: ' + backupName);

    var cel = 0;
    porFazer.forEach(function(l) {
      l.alteracoes.forEach(function(a) {
        sh.getRange(l.linha, a.col).setValue(a.depois);
        cel++;
      });
    });
    totalCel += cel;
    rel.push('  ' + porFazer.length + ' linha(s) corrigida(s) · ' + cel + ' célula(s) reescrita(s).');
    rel.push('');
  });

  rel.push('TOTAL: ' + totalCel + ' célula(s) reescrita(s).');
  rel.push('Os T-scores ficam vazios. A conversão bruto→T deve ser feita no Apêndice B.');
  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}

// ─────────────────────────────────────────────────────────────
// Bloqueio da reparação v100. Nada foi removido: esta declaração
// vem depois da original e, por hoisting, é a que fica activa.
// Motivo: escrevia T-scores a partir de tabelas não validadas.
// ─────────────────────────────────────────────────────────────
function repararCotacoesConnersShort(confirmacao) {
  var aviso =
    'BLOQUEADA (v102). Esta função reescrevia os T-scores a partir das tabelas de\n' +
    'CONNERS_SHORT_V100, que não foram transcritas do manual — são interpolação\n' +
    'linear entre 40 e 90. Corrigia os brutos mas repunha T-scores inválidos.\n' +
    'Use repararRawConnersShort(\'CONFIRMO\'), que recalcula os brutos e deixa os\n' +
    'T-scores vazios. A conversão bruto→T faz-se no Apêndice B.';
  Logger.log(aviso);
  return aviso;
}


// ═════════════════════════════════════════════════════════════


// ═════════════════════════════════════════════════════════════
// v103 — LIMPEZA DOS DERIVADOS NÃO REPRODUZÍVEIS
// ─────────────────────────────────────────────────────────────
// A auditoria v102 devolveu 0 células a corrigir: todas as linhas
// existentes têm o JSON de Respostas num formato anterior (31 em
// vez de 45 no CONNERS3PS, 27 em vez de 41 no CONNERS3TS), pelo
// que o recálculo é impossível e a v102 deixava-as intactas — T
// inválidos incluídos. O cuidado de não recalcular o que não se
// consegue reproduzir estava certo; deixar lá o resultado antigo
// não estava.
//
// v103 separa dado primário de dado derivado:
//   · Respostas (JSON), Data, Codigo, nomes, Relação, Idade
//     — NUNCA são tocados. É o registo original do respondente.
//   · Raw_* e T_* são derivados. Se não forem reproduzíveis a
//     partir do primário, não têm proveniência verificável e são
//     limpos.
//
// Por linha:
//   JSON no formato actual  → Raw_* recalculado · T_* vazio
//   JSON noutro formato     → Raw_* e T_* vazios
//   sem JSON                → Raw_* e T_* vazios
//
// Nada se perde: com as Respostas intactas, qualquer cotação
// futura é refazível assim que os mapas de itens forem
// confirmados contra o manual.
//
// Ordem de execução:
//   1) auditarConnersShortV103()
//   2) repararConnersShortV103('CONFIRMO')
// ═════════════════════════════════════════════════════════════

function conners103_plano(abaNome) {
  var def = CONNERS_SHORT_V100[abaNome];
  var sh  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(abaNome);
  if (!def) return { erro: 'Instrumento desconhecido: ' + abaNome };
  if (!sh)  return { erro: 'Aba inexistente: ' + abaNome };
  if (sh.getLastRow() < 2) return { aba: abaNome, linhas: [], semDados: true };

  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  for (var c = 0; c < head.length; c++) idx[String(head[c]).trim()] = c;

  var emFalta = [];
  ['Respostas', 'Idade', 'Codigo'].forEach(function(n) {
    if (idx[n] === undefined) emFalta.push(n);
  });
  def.escalas.forEach(function(e) {
    if (idx['Raw_' + e.code] === undefined) emFalta.push('Raw_' + e.code);
    if (idx['T_' + e.code]   === undefined) emFalta.push('T_' + e.code);
  });
  if (emFalta.length) {
    return { erro: 'Colunas em falta no cabeçalho: ' + emFalta.join(', ') +
                   '. Correr primeiro repararCabecalhoConners3PS() (v101).' };
  }

  var dados = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var linhas = [];
  for (var r = 0; r < dados.length; r++) {
    var row = dados[r];
    var reg = { linha: r + 2, codigo: row[idx['Codigo']], alteracoes: [], estado: '' };

    var resp = null;
    try { resp = JSON.parse(row[idx['Respostas']]); } catch (e) { resp = null; }
    var reproduzivel = !!(resp && resp.length === def.nItens);
    var cot = reproduzivel ? conners102_cotarRaw(def, resp) : null;

    def.escalas.forEach(function(e) {
      var cRaw = idx['Raw_' + e.code], cT = idx['T_' + e.code];
      var novoRaw = '';
      if (reproduzivel && cot.scores[e.code] !== null) novoRaw = cot.scores[e.code];
      if (String(row[cRaw]) !== String(novoRaw)) {
        reg.alteracoes.push({ col: cRaw + 1, nome: 'Raw_' + e.code,
                              antes: row[cRaw], depois: novoRaw });
      }
      if (String(row[cT]) !== '') {
        reg.alteracoes.push({ col: cT + 1, nome: 'T_' + e.code,
                              antes: row[cT], depois: '' });
      }
    });

    if (!resp)                 reg.estado = 'sem JSON → derivados limpos';
    else if (!reproduzivel)    reg.estado = 'JSON com ' + resp.length + ' valores (formato actual: ' +
                                            def.nItens + ') → derivados limpos, Respostas preservadas';
    else                       reg.estado = 'JSON no formato actual → brutos recalculados, T limpos';
    if (!reg.alteracoes.length) reg.estado = 'já no estado pretendido';
    linhas.push(reg);
  }
  return { aba: abaNome, linhas: linhas };
}

function auditarConnersShortV103() {
  var rel = ['AUDITORIA v103 — limpeza dos derivados não reproduzíveis', ''];
  rel.push('Respostas, Data, Codigo, nomes, Relação e Idade nunca são tocados.');
  rel.push('');
  var totalCel = 0, totalLin = 0;

  Object.keys(CONNERS_SHORT_V100).forEach(function(aba) {
    var res = conners103_plano(aba);
    rel.push('───────────── ' + aba);
    if (res.erro)     { rel.push('  ' + res.erro); rel.push(''); return; }
    if (res.semDados) { rel.push('  Sem linhas de dados.'); rel.push(''); return; }
    var comAlt = 0, cel = 0;
    res.linhas.forEach(function(l) {
      if (l.alteracoes.length) { comAlt++; cel += l.alteracoes.length; }
    });
    totalLin += comAlt; totalCel += cel;
    rel.push('  ' + res.linhas.length + ' linha(s) · ' + comAlt + ' a alterar · ' + cel + ' célula(s)');
    res.linhas.forEach(function(l) {
      rel.push('   linha ' + l.linha + ' [' + l.codigo + ']: ' + l.estado);
      l.alteracoes.forEach(function(a) {
        rel.push('        ' + a.nome + ': ' + (a.antes === '' ? '(vazio)' : a.antes) +
                 ' → ' + (a.depois === '' ? '(vazio)' : a.depois));
      });
    });
    rel.push('');
  });

  rel.push('TOTAL: ' + totalLin + ' linha(s), ' + totalCel + ' célula(s).');
  rel.push('→ Simulação. Para aplicar: repararConnersShortV103(\'CONFIRMO\')');
  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}

function repararConnersShortV103(confirmacao) {
  if (confirmacao !== 'CONFIRMO') {
    var aviso = 'Confirmação em falta. Correr primeiro auditarConnersShortV103() e, ' +
                'depois de rever o relatório, repararConnersShortV103(\'CONFIRMO\').';
    Logger.log(aviso);
    return aviso;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var carimbo = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
  var rel = ['REPARAÇÃO v103 — derivados limpos, Respostas preservadas', ''];
  var totalCel = 0;

  Object.keys(CONNERS_SHORT_V100).forEach(function(aba) {
    var res = conners103_plano(aba);
    rel.push('───────────── ' + aba);
    if (res.erro)     { rel.push('  ' + res.erro); rel.push(''); return; }
    if (res.semDados) { rel.push('  Sem linhas de dados.'); rel.push(''); return; }
    var porFazer = res.linhas.filter(function(l) { return l.alteracoes.length; });
    if (!porFazer.length) { rel.push('  Nada a alterar.'); rel.push(''); return; }

    var sh = ss.getSheetByName(aba);
    var backupName = aba + '_BACKUP_' + carimbo;
    if (!ss.getSheetByName(backupName)) sh.copyTo(ss).setName(backupName);
    rel.push('  Backup: ' + backupName);

    var cel = 0;
    porFazer.forEach(function(l) {
      l.alteracoes.forEach(function(a) {
        sh.getRange(l.linha, a.col).setValue(a.depois);
        cel++;
      });
    });
    totalCel += cel;
    rel.push('  ' + porFazer.length + ' linha(s) · ' + cel + ' célula(s) alterada(s).');
    rel.push('');
  });

  rel.push('TOTAL: ' + totalCel + ' célula(s).');
  rel.push('O JSON de Respostas ficou intacto em todas as linhas: a cotação é');
  rel.push('refazível assim que os mapas de itens forem confirmados no manual.');
  var txt = rel.join('\n');
  Logger.log(txt);
  return txt;
}


// ═════════════════════════════════════════════════════════════
