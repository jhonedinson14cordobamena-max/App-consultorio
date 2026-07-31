/**
 * "Vive la Historia": experiencias narrativas en primera/segunda persona.
 *
 * Este modo es GRATIS y no forma parte de los 120 niveles de pago. La idea
 * es distinta a la trivia: en vez de responder preguntas SOBRE un
 * personaje, el jugador vive la historia COMO el personaje, tomando
 * decisiones en los momentos clave del relato.
 *
 * Diseño honesto: los relatos bíblicos ya ocurrieron y están fijos; el
 * juego no reescribe la Escritura según lo que el jugador elija. Por eso
 * cada decisión lleva a una reacción/reflexión distinta (el "cómo se
 * sintió" o "qué pensó" en ese momento), pero la historia converge
 * siempre al mismo desenlace bíblico. La libertad está en cómo el
 * jugador habita emocionalmente la decisión, no en cambiar el resultado.
 *
 * Estructura de cada experiencia:
 *   - intro: contexto en segunda persona ("Eres...").
 *   - scenes[]: cada una tiene texto narrativo y 2 opciones, cada una con
 *     su propia reacción/feedback (ambas continúan a la misma siguiente escena).
 *   - ending: qué pasó, fiel al relato bíblico, con su referencia.
 *   - reflection: una línea que conecta la experiencia con la vida de hoy.
 */

const EXPERIENCES_ES = [
  {
    id: "noah",
    character: "Noé",
    tierColor: "#4caf7d",
    title: "El diluvio",
    ref: "Génesis 6–9",
    intro: "Eres Noé, un hombre justo en medio de una generación corrupta. Dios te ha dicho que un diluvio va a destruir la tierra, y te ha dado instrucciones precisas para construir un arca inmensa: 300 codos de largo, 50 de ancho, 30 de alto.",
    scenes: [
      {
        text: "Llevas meses construyendo bajo el sol. Tus vecinos pasan cada día y se burlan: '¿Un barco, en medio de la tierra seca?' Nunca ha llovido así antes.",
        choices: [
          { label: "Seguir construyendo exactamente como Dios te indicó", feedback: "Decides confiar en la palabra de Dios más que en la opinión de la gente. Sigues clavando tabla tras tabla, codo a codo, sin atajos." },
          { label: "Sentir la tentación de simplificar el diseño para terminar antes", feedback: "Dudas un momento... pero recuerdas que Dios fue específico por una razón. Vuelves a las medidas exactas, aunque tome más tiempo." },
        ],
      },
      {
        text: "El arca está terminada. De pronto, animales de toda clase comienzan a llegar por su cuenta, en parejas —y siete de los limpios—, como si algo los guiara. Entras con tu familia, y Dios mismo cierra la puerta detrás de ti.",
        choices: [
          { label: "Sentir paz, confiando en que Dios cerró la puerta por tu protección", feedback: "Un silencio extraño llena el arca. No fuiste tú quien cerró la puerta: fue Dios. Eso te da una calma que no depende de lo que veas afuera." },
          { label: "Sentir miedo al escuchar la puerta sellarse, sin poder salir", feedback: "El miedo es humano y real. Pero mientras escuchas la lluvia empezar a caer, entiendes que esa misma puerta cerrada es lo que los mantiene a salvo." },
        ],
      },
      {
        text: "Llueve 40 días y 40 noches. El agua cubre hasta las montañas más altas. Durante meses no ves nada más que agua desde la única ventana del arca.",
        choices: [
          { label: "Esperar con paciencia, confiando en la promesa de Dios", feedback: "Envías una paloma, y después de días, regresa con una rama de olivo en el pico: la señal de que el agua está bajando." },
          { label: "Desesperar por no ver tierra durante tanto tiempo", feedback: "Es agotador esperar sin ver el final. Pero sigues confiando, y finalmente sientes que el arca deja de moverse: ha tocado tierra, en las montañas de Ararat." },
        ],
      },
    ],
    ending: "Cuando la tierra se seca, sales del arca con tu familia y todos los animales. Dios pone un arcoíris en el cielo como señal de su pacto: nunca más destruirá la tierra con un diluvio.",
    reflection: "Como Noé, a veces obedecer instrucciones específicas de Dios parece exagerado ante los ojos de los demás — pero la fidelidad en lo pequeño y preciso es lo que sostiene cuando llega la tormenta.",
  },
  {
    id: "abraham-isaac",
    character: "Abraham",
    tierColor: "#5aa9e6",
    title: "La prueba más difícil",
    ref: "Génesis 22",
    intro: "Eres Abraham. Esperaste 25 años la promesa de un hijo, y por fin llegó Isaac, el niño que tanto amas. Ahora Dios te pide algo que no puedes comprender: llevarlo al monte Moriah y ofrecerlo en sacrificio.",
    scenes: [
      {
        text: "Te levantas de madrugada, preparas la leña, y emprendes un viaje de tres días junto a Isaac, sin decirle a nadie el verdadero propósito.",
        choices: [
          { label: "Confiar en que Dios cumplirá su promesa de algún modo, aunque no entiendas cómo", feedback: "Recuerdas que Dios prometió que de Isaac vendría una gran nación. No sabes cómo se resolverá esto, pero decides obedecer confiando en el carácter de Dios." },
          { label: "Cargar en silencio con la angustia de no entender la orden", feedback: "El camino es largo y pesado. No tienes todas las respuestas, pero sigues caminando, un paso a la vez, hacia el monte." },
        ],
      },
      {
        text: "Isaac te pregunta: 'Padre, aquí está el fuego y la leña, pero ¿dónde está el cordero para el sacrificio?'",
        choices: [
          { label: "Responder con fe: 'Dios proveerá el cordero, hijo mío'", feedback: "No es una evasiva: es una convicción. Aunque no ves todavía cómo, declaras en voz alta tu confianza en que Dios proveerá." },
          { label: "Sentir el peso de la pregunta sin saber bien qué responder", feedback: "Tragas saliva antes de responder. Aun con el nudo en la garganta, le dices a Isaac que Dios proveerá — y sigues caminando." },
        ],
      },
      {
        text: "Llegas al lugar, construyes el altar, atas a Isaac sobre la leña, y levantas el cuchillo.",
        choices: [
          { label: "Obedecer hasta el último instante, confiando en Dios por completo", feedback: "En el momento exacto, un ángel del Señor te llama desde el cielo: '¡Abraham, Abraham! No pongas tu mano sobre el muchacho'." },
          { label: "Dudar en ese último segundo, con el corazón destrozado", feedback: "Tu mano tiembla. Justo entonces, la voz del ángel del Señor detiene todo: 'No pongas tu mano sobre el muchacho'." },
        ],
      },
    ],
    ending: "Levantas la vista y ves un carnero atrapado por los cuernos en un matorral. Lo ofreces en lugar de Isaac. Llamas a ese lugar 'el Señor proveerá'. Dios confirma su pacto contigo: tu descendencia será tan numerosa como las estrellas.",
    reflection: "La obediencia de Abraham no fue ciega: fue confianza construida a lo largo de años de conocer el carácter de Dios. La prueba más difícil reveló que Dios provee incluso cuando el camino parece no tener salida.",
  },
  {
    id: "moses-red-sea",
    character: "Moisés",
    tierColor: "#f2b134",
    title: "El Mar Rojo",
    ref: "Éxodo 14",
    intro: "Eres Moisés. Acabas de sacar al pueblo de Israel de Egipto tras las diez plagas. Pero el Faraón cambió de opinión: su ejército, con 600 carros de guerra, viene detrás de ustedes. Frente a ti está el Mar Rojo. Detrás, el ejército más poderoso de la tierra.",
    scenes: [
      {
        text: "El pueblo te grita, aterrado: '¿No había sepulcros en Egipto, que nos trajiste a morir al desierto?' El pánico se extiende rápidamente entre miles de personas.",
        choices: [
          { label: "Responder con calma: 'No temáis; el Señor peleará por vosotros'", feedback: "Alzas la voz sobre el caos: 'Estad quietos, y ved la salvación que el Señor os dará hoy.' No tienes un plan humano, pero tienes una promesa." },
          { label: "Sentir tú mismo el peso del miedo del pueblo antes de responder", feedback: "Por un instante, el miedo también te toca a ti. Pero clamas a Dios, y una certeza mayor que el miedo se abre paso en tu pecho." },
        ],
      },
      {
        text: "Dios te dice: 'Extiende tu mano sobre el mar'. Una columna de nube y fuego se mueve para ponerse entre Israel y el ejército egipcio.",
        choices: [
          { label: "Extender la vara con obediencia inmediata", feedback: "Levantas tu vara sobre el mar. Un fuerte viento del oriente sopla toda la noche, y las aguas comienzan a dividirse ante tus ojos." },
          { label: "Dudar un instante ante lo imposible del acto", feedback: "Es un gesto que no tiene lógica humana: levantar una vara ante un mar. Aun así, obedeces, y el mar mismo responde." },
        ],
      },
      {
        text: "El pueblo camina por tierra seca, con muros de agua a ambos lados. El ejército egipcio los sigue dentro del mar abierto.",
        choices: [
          { label: "Extender tu mano de nuevo cuando Dios te lo indica, para que el mar regrese", feedback: "Cuando el último israelita cruza, extiendes tu mano una vez más. El mar vuelve a su lugar sobre el ejército que los perseguía." },
          { label: "Mirar atrás con asombro mientras cruzan, sin saber aún cómo terminará", feedback: "Miras el agua sostenida como paredes invisibles y no puedes evitar el asombro. Cuando todos han cruzado, obedeces la última instrucción de Dios." },
        ],
      },
    ],
    ending: "El mar regresa a su cauce y cubre a todo el ejército egipcio. Israel ve la salvación de Dios ese día. Miriam toma un pandero y todas las mujeres cantan y bailan de alegría en la orilla.",
    reflection: "Entre el miedo del pueblo y el ejército que se acercaba, Moisés no tenía una salida humana — solo la obediencia de extender la mano cuando Dios lo pidió. A veces la liberación llega justo en el punto donde ya no hay más opciones propias.",
  },
  {
    id: "david-goliath",
    character: "David",
    tierColor: "#e07a5f",
    title: "David y Goliat",
    ref: "1 Samuel 17",
    intro: "Eres David, un joven pastor que ha venido a llevarle comida a tus hermanos en el campo de batalla. Los ejércitos de Israel y de los filisteos están frente a frente, paralizados, porque cada mañana el gigante Goliat —de casi 3 metros— sale a desafiar a cualquiera que se atreva a enfrentarlo.",
    scenes: [
      {
        text: "Escuchas a Goliat gritar sus insultos contra el Dios de Israel por cuadragésima vez. Nadie en el ejército se atreve a responder. Sientes algo que los soldados experimentados no sienten.",
        choices: [
          { label: "Indignarte: '¿Quién es este filisteo incircunciso para desafiar al Dios viviente?'", feedback: "No es arrogancia: es que ves el problema desde otro ángulo. No es Israel contra Goliat; es Goliat contra el Dios viviente." },
          { label: "Sentir miedo al ver al gigante, pero decidir hablar de todas formas", feedback: "El miedo es real —Goliat impone—, pero decides que el temor no tendrá la última palabra. Vas a hablar con el rey Saúl." },
        ],
      },
      {
        text: "El rey Saúl te ofrece su propia armadura: casco de bronce, cota de malla, espada. Te la pones, das unos pasos... y casi no puedes moverte.",
        choices: [
          { label: "Quitarte la armadura y confiar en lo que ya conoces: tu honda", feedback: "'No puedo andar con esto, porque nunca lo practiqué', le dices al rey. Te quitas la armadura ajena y tomas tu cayado, tu honda y cinco piedras lisas del arroyo." },
          { label: "Dudar si rechazar la armadura del rey es una falta de respeto", feedback: "Por un momento te preocupa lo que pensará Saúl. Pero sabes que pelear con herramientas ajenas, que no conoces, sería más peligroso que confiar en lo tuyo." },
        ],
      },
      {
        text: "Goliat te ve acercarte y se burla: eres solo un muchacho con un cayado. Avanza hacia ti armado con espada, lanza y jabalina.",
        choices: [
          { label: "Correr hacia él con confianza: 'Tú vienes con espada, yo vengo en el nombre del Señor'", feedback: "Corres hacia la línea de batalla, sacas una piedra de tu bolsa, la pones en la honda, y la lanzas con toda tu fuerza y precisión." },
          { label: "Sentir el peso del momento pero avanzar de todas formas", feedback: "El corazón te late fuerte, pero tus manos ya conocen este movimiento de mil tardes pastoreando. Lanzas la piedra sin dudar." },
        ],
      },
    ],
    ending: "La piedra golpea a Goliat justo en la frente, y el gigante cae al suelo. Corres, tomas su propia espada, y el ejército filisteo huye al ver caído a su campeón. Israel obtiene una gran victoria ese día.",
    reflection: "David no venció con una armadura prestada ni fingiendo ser alguien más grande: venció con lo que ya conocía, puesto al servicio de una confianza que iba más allá de su propio tamaño.",
  },
  {
    id: "daniel-lions",
    character: "Daniel",
    tierColor: "#9b5de5",
    title: "El foso de los leones",
    ref: "Daniel 6",
    intro: "Eres Daniel, un alto funcionario del rey Darío, tan íntegro que tus rivales no logran encontrar ninguna falta en tu trabajo para acusarte. Así que deciden atacar tu fe: convencen al rey de firmar un decreto que prohíbe orar a cualquier dios excepto al rey mismo, durante 30 días. Quien lo desobedezca será arrojado al foso de los leones.",
    scenes: [
      {
        text: "Te enteras del decreto recién firmado. Sabes exactamente lo que implica seguir orando junto a tu ventana abierta hacia Jerusalén, como haces tres veces al día desde hace años.",
        choices: [
          { label: "Seguir orando exactamente como siempre, con la ventana abierta, sin esconderte", feedback: "No cambias nada de tu rutina de oración. No es un acto de provocación: es sencillamente quién eres, decreto o no decreto." },
          { label: "Considerar por un momento orar en privado para evitar el riesgo", feedback: "Por un instante piensas en lo razonable que sería orar en secreto. Pero decides que ocultar tu fe por miedo sería entregarle al decreto algo que no le corresponde." },
        ],
      },
      {
        text: "Tus rivales te sorprenden orando y corren a acusarte ante el rey Darío. El rey, angustiado, se da cuenta de que fue manipulado, pero la ley del reino no puede revocarse.",
        choices: [
          { label: "Mantener la calma y la confianza mientras te llevan al foso", feedback: "No hay pánico en ti. Sabes en quién has confiado durante toda tu vida, y esa confianza no depende de lo que pase esa noche." },
          { label: "Sentir la gravedad del momento mientras sellan la piedra sobre el foso", feedback: "Escuchas la piedra sellarse sobre el foso y el peso de la situación es real. Aun así, tu confianza no se basa en escapar del peligro, sino en Dios mismo." },
        ],
      },
      {
        text: "Pasas la noche entera en el foso, rodeado de leones hambrientos.",
        choices: [
          { label: "Confiar en que Dios puede cerrar la boca de los leones, como ya lo ha hecho antes con otros", feedback: "Los leones están ahí, pero no se acercan a ti. Pasas la noche en una calma que no tiene explicación humana." },
          { label: "Vivir esa noche como la más larga de tu vida, sosteniéndote en la oración", feedback: "Cada hora se siente eterna. Pero sigues orando, igual que siempre lo has hecho, y amaneces con vida." },
        ],
      },
    ],
    ending: "Al amanecer, el rey corre al foso y grita angustiado preguntando si tu Dios te ha librado. Respondes: 'Mi Dios envió su ángel, y cerró la boca de los leones.' No tienes ni un rasguño. El rey Darío ordena que todos en el reino teman al Dios de Daniel.",
    reflection: "Daniel no cambió su rutina de fe por miedo a un decreto humano — y esa constancia silenciosa, sostenida durante años antes de esa noche, fue lo que lo sostuvo cuando llegó la prueba más grande.",
  },
  {
    id: "jonah",
    character: "Jonás",
    tierColor: "#00bbf9",
    title: "El gran pez",
    ref: "Jonás 1–4",
    intro: "Eres Jonás, profeta de Israel. Dios te ha dado una orden clara: ve a Nínive, la gran ciudad enemiga, y anuncia su juicio. Pero Nínive es la capital de Asiria, el pueblo que más odias, y no quieres que se arrepientan y sean perdonados.",
    scenes: [
      {
        text: "En lugar de ir a Nínive, compras un pasaje en un barco hacia Tarsis, en la dirección exactamente opuesta.",
        choices: [
          { label: "Huir de todas formas, aunque sabes que no puedes escapar de Dios", feedback: "Sabes, en el fondo, que esto no tiene sentido — pero el resentimiento habla más fuerte que la razón en este momento, y subes al barco." },
          { label: "Sentir el peso de la desobediencia mientras te alejas del puerto", feedback: "Mientras el barco se aleja, sientes que algo no está bien. Pero decides seguir de todos modos, tratando de acallar esa inquietud." },
        ],
      },
      {
        text: "Una tormenta violenta golpea el barco. Los marineros, aterrados, echan suertes para saber quién causó esta desgracia — y caen sobre ti.",
        choices: [
          { label: "Confesar la verdad: 'Soy yo quien huye del Dios que hizo el mar y la tierra seca'", feedback: "Les dices toda la verdad, sin excusas. Y les pides que te arrojen al mar para que la tormenta se calme, para no arriesgar sus vidas." },
          { label: "Dudar antes de confesar, sabiendo lo que probablemente pedirán que hagan contigo", feedback: "Te cuesta admitirlo, pero terminas contando la verdad completa. Sabes lo que viene después, y aun así lo aceptas." },
        ],
      },
      {
        text: "Te arrojan al mar. La tormenta se calma al instante. Pero en vez de ahogarte, un gran pez te traga, y pasas tres días y tres noches en su interior.",
        choices: [
          { label: "Orar desde el fondo del mar, reconociendo la misericordia de Dios incluso en el castigo", feedback: "Desde el vientre del pez, oras. Reconoces que huiste, pero también que la salvación pertenece al Señor." },
          { label: "Pasar esos tres días reflexionando en silencio antes de poder orar", feedback: "Al principio el shock es total. Pero con el paso de las horas en la oscuridad, terminas clamando a Dios desde ese lugar imposible." },
        ],
      },
    ],
    ending: "El pez te vomita en tierra firme. Esta vez vas a Nínive y predicas el mensaje. Toda la ciudad se arrepiente, desde el rey hasta el último ciudadano, y Dios decide no destruirla. Te enojas por la misericordia de Dios hacia tus enemigos, y Dios te pregunta con paciencia: '¿Haces bien en enojarte tanto?'",
    reflection: "Jonás obedeció al final, pero seguía luchando por dentro con la idea de que Dios pudiera tener misericordia de quienes él consideraba indignos de ella — un recordatorio de que la obediencia externa no siempre resuelve de inmediato las luchas del corazón.",
  },
  {
    id: "esther",
    character: "Ester",
    tierColor: "#845ec2",
    title: "Para un momento como este",
    ref: "Ester 4–7",
    intro: "Eres Ester, reina de Persia, pero nadie en el palacio sabe que eres judía. Amán, el segundo hombre más poderoso del imperio, ha logrado que el rey firme un decreto para exterminar a todos los judíos del reino en un solo día. Tu primo Mardoqueo te suplica que hables con el rey.",
    scenes: [
      {
        text: "Mardoqueo te dice: 'Quizás para un momento como este has llegado al reino.' Pero presentarte ante el rey sin ser llamada puede costarte la vida — es la ley del palacio, incluso para la reina.",
        choices: [
          { label: "Decidir hablar, aunque el riesgo sea real: 'Si perezco, que perezca'", feedback: "Pides que todos ayunen contigo tres días antes de actuar. Decides que el riesgo de callar es mayor que el riesgo de hablar." },
          { label: "Sentir miedo genuino ante la posibilidad de perder la vida", feedback: "El miedo es honesto y real —no es un capricho arriesgar la vida—, pero decides que proteger a tu pueblo pesa más que tu propia seguridad." },
        ],
      },
      {
        text: "Te presentas ante el rey sin haber sido llamada. Él extiende su cetro de oro hacia ti — señal de que no serás castigada — y te pregunta qué deseas.",
        choices: [
          { label: "Actuar con paciencia y estrategia, invitando al rey y a Amán a un banquete primero", feedback: "En lugar de acusar de inmediato, invitas al rey y a Amán a un banquete. Sabes que el momento y la manera de decir la verdad importan tanto como la verdad misma." },
          { label: "Sentir el impulso de decirlo todo de inmediato, pero elegir esperar", feedback: "Todo en ti quiere decirlo ya, pero eliges la paciencia. Preparas un segundo banquete antes de revelar lo que está en juego." },
        ],
      },
      {
        text: "En el segundo banquete, con el rey y Amán presentes, llega el momento de hablar.",
        choices: [
          { label: "Revelar la verdad con valentía: 'Se ha vendido a mi pueblo para ser destruido, y yo soy judía'", feedback: "Hablas con claridad, sin rodeos. El rey se enfurece al descubrir el plan de Amán contra tu pueblo — y contra ti." },
          { label: "Reunir el valor en el momento mismo de hablar, sintiendo el peso de cada palabra", feedback: "El corazón te late con fuerza, pero las palabras salen firmes: le cuentas al rey exactamente lo que Amán ha planeado." },
        ],
      },
    ],
    ending: "El rey ordena ejecutar a Amán en la misma horca que él había preparado para Mardoqueo. Se emite un nuevo decreto que permite a los judíos defenderse. Tu pueblo es salvado, y hasta hoy se celebra la fiesta de Purim en memoria de esta liberación.",
    reflection: "Ester no actuó por impulso ni por miedo paralizante: actuó con valentía y con paciencia estratégica a la vez, entendiendo que a veces el momento de hablar importa tanto como el coraje de hacerlo.",
  },
  {
    id: "peter-restoration",
    character: "Pedro",
    tierColor: "#f15bb5",
    title: "La negación y la restauración",
    ref: "Mateo 26; Juan 21",
    intro: "Eres Pedro, uno de los discípulos más cercanos de Jesús. Horas antes le prometiste que nunca lo abandonarías, ni siquiera si tuvieras que morir con él. Ahora Jesús ha sido arrestado, y tú lo sigues de lejos hasta el patio del sumo sacerdote.",
    scenes: [
      {
        text: "Una sirvienta te mira junto al fuego y dice: 'Tú también estabas con Jesús el galileo.' Sientes todas las miradas del patio sobre ti.",
        choices: [
          { label: "Negar con miedo: 'No sé de qué hablas'", feedback: "Las palabras salen antes de que puedas detenerlas. El miedo en ese patio es más fuerte de lo que imaginaste que sería." },
          { label: "Dudar un instante antes de negar, sintiendo el conflicto interno", feedback: "Por una fracción de segundo piensas en decir la verdad. Pero el miedo gana esta vez, y niegas conocerlo." },
        ],
      },
      {
        text: "Otras dos personas más te reconocen y te acusan de ser uno de los discípulos. Cada vez niegas con más fuerza, hasta jurar que no conoces a Jesús.",
        choices: [
          { label: "Sentir que cada negación te hunde más, sin poder detenerte", feedback: "Es como una caída que no puedes frenar. Cada negación te aleja más de quien realmente quieres ser." },
          { label: "Notar el peso creciente de tus propias palabras mientras las dices", feedback: "Incluso mientras hablas, una parte de ti observa con horror lo que está saliendo de tu boca." },
        ],
      },
      {
        text: "En ese instante, un gallo canta. Jesús, que está siendo llevado a través del patio, se vuelve y te mira directamente a los ojos.",
        choices: [
          { label: "Recordar la advertencia de Jesús y salir a llorar amargamente", feedback: "La mirada de Jesús no es de condena, sino de tristeza compartida. Sales de ahí y lloras como no habías llorado nunca." },
          { label: "Sentir vergüenza y quebranto al cruzar la mirada con él", feedback: "Ese cruce de miradas dura un instante, pero te marca para siempre. Sales del patio deshecho por dentro." },
        ],
      },
    ],
    ending: "Días después de la resurrección, junto al mar de Galilea, Jesús te pregunta tres veces —una por cada negación— '¿Me amas?'. Cada vez respondes que sí, y cada vez Jesús te confía una tarea: 'Apacienta mis ovejas.' No hay reproche final, solo restauración y una nueva misión.",
    reflection: "La historia de Pedro no termina en la negación, sino en la restauración: Jesús no descartó a quien había fallado tan públicamente, sino que le devolvió, uno a uno, exactamente lo que había negado.",
  },
];

const EXPERIENCES_EN = [
  {
    id: "noah",
    character: "Noah",
    tierColor: "#4caf7d",
    title: "The Flood",
    ref: "Genesis 6–9",
    intro: "You are Noah, a righteous man in the middle of a corrupt generation. God has told you a flood is going to destroy the earth, and has given you precise instructions to build an enormous ark: 300 cubits long, 50 wide, 30 high.",
    scenes: [
      {
        text: "You've spent months building under the sun. Your neighbors pass by every day and mock you: 'A boat, in the middle of dry land?' It has never rained like that before.",
        choices: [
          { label: "Keep building exactly as God instructed", feedback: "You decide to trust God's word more than people's opinions. You keep nailing board after board, cubit by cubit, with no shortcuts." },
          { label: "Feel the temptation to simplify the design to finish sooner", feedback: "You hesitate for a moment... but remember God was specific for a reason. You go back to the exact measurements, even if it takes longer." },
        ],
      },
      {
        text: "The ark is finished. Suddenly, animals of every kind begin arriving on their own, in pairs — and seven of the clean ones — as if something were guiding them. You go in with your family, and God himself shuts the door behind you.",
        choices: [
          { label: "Feel peace, trusting that God shut the door for your protection", feedback: "A strange silence fills the ark. You weren't the one who closed the door: God was. That gives you a calm that doesn't depend on what you see outside." },
          { label: "Feel fear hearing the door seal shut, unable to leave", feedback: "The fear is human and real. But as you listen to the rain begin to fall, you understand that same closed door is what's keeping you safe." },
        ],
      },
      {
        text: "It rains 40 days and 40 nights. The water covers even the highest mountains. For months you see nothing but water through the ark's only window.",
        choices: [
          { label: "Wait patiently, trusting God's promise", feedback: "You send out a dove, and after some days, it returns with an olive leaf in its beak: the sign that the water is going down." },
          { label: "Despair at not seeing land for so long", feedback: "It's exhausting to wait without seeing the end. But you keep trusting, and finally you feel the ark stop moving: it has touched ground, on the mountains of Ararat." },
        ],
      },
    ],
    ending: "When the earth dries, you come out of the ark with your family and all the animals. God places a rainbow in the sky as a sign of his covenant: he will never again destroy the earth with a flood.",
    reflection: "Like Noah, sometimes obeying God's specific instructions looks excessive in other people's eyes — but faithfulness in the small, precise details is what holds you up when the storm arrives.",
  },
  {
    id: "abraham-isaac",
    character: "Abraham",
    tierColor: "#5aa9e6",
    title: "The Hardest Test",
    ref: "Genesis 22",
    intro: "You are Abraham. You waited 25 years for the promised son, and Isaac finally arrived — the boy you love so much. Now God asks you something you cannot understand: take him to Mount Moriah and offer him as a sacrifice.",
    scenes: [
      {
        text: "You get up before dawn, prepare the wood, and set out on a three-day journey with Isaac, without telling anyone the real purpose.",
        choices: [
          { label: "Trust that God will fulfill his promise somehow, even if you don't understand how", feedback: "You remember God promised that a great nation would come from Isaac. You don't know how this will be resolved, but you decide to obey, trusting God's character." },
          { label: "Carry the anguish of not understanding the order in silence", feedback: "The road is long and heavy. You don't have all the answers, but you keep walking, one step at a time, toward the mountain." },
        ],
      },
      {
        text: "Isaac asks you: 'Father, here is the fire and the wood, but where is the lamb for the sacrifice?'",
        choices: [
          { label: "Answer with faith: 'God will provide the lamb, my son'", feedback: "It's not a dodge: it's a conviction. Even though you don't yet see how, you declare out loud your trust that God will provide." },
          { label: "Feel the weight of the question without quite knowing how to answer", feedback: "You swallow hard before answering. Even with a lump in your throat, you tell Isaac that God will provide — and keep walking." },
        ],
      },
      {
        text: "You reach the place, build the altar, bind Isaac on the wood, and raise the knife.",
        choices: [
          { label: "Obey to the very last instant, trusting God completely", feedback: "At the exact moment, an angel of the Lord calls out from heaven: 'Abraham, Abraham! Do not lay your hand on the boy.'" },
          { label: "Waver in that last second, with your heart breaking", feedback: "Your hand trembles. Right then, the angel's voice stops everything: 'Do not lay your hand on the boy.'" },
        ],
      },
    ],
    ending: "You look up and see a ram caught by its horns in a thicket. You offer it in Isaac's place. You call that place 'the Lord will provide.' God confirms his covenant with you: your descendants will be as numerous as the stars.",
    reflection: "Abraham's obedience wasn't blind: it was trust built over years of knowing God's character. The hardest test revealed that God provides even when the road seems to have no way out.",
  },
  {
    id: "moses-red-sea",
    character: "Moses",
    tierColor: "#f2b134",
    title: "The Red Sea",
    ref: "Exodus 14",
    intro: "You are Moses. You've just led the people of Israel out of Egypt after the ten plagues. But Pharaoh changed his mind: his army, with 600 war chariots, is coming after you. Ahead of you is the Red Sea. Behind you, the most powerful army on earth.",
    scenes: [
      {
        text: "The people scream at you, terrified: 'Were there no graves in Egypt, that you brought us to die in the desert?' Panic spreads quickly among thousands of people.",
        choices: [
          { label: "Answer calmly: 'Do not be afraid; the Lord will fight for you'", feedback: "You raise your voice over the chaos: 'Stand firm, and see the salvation the Lord will give you today.' You have no human plan, but you have a promise." },
          { label: "Feel the weight of the people's fear yourself before responding", feedback: "For a moment, the fear touches you too. But you cry out to God, and a certainty greater than the fear breaks through in your chest." },
        ],
      },
      {
        text: "God tells you: 'Stretch out your hand over the sea.' A pillar of cloud and fire moves to stand between Israel and the Egyptian army.",
        choices: [
          { label: "Stretch out your staff with immediate obedience", feedback: "You raise your staff over the sea. A strong east wind blows all night, and the waters begin to part before your eyes." },
          { label: "Hesitate for a moment at how impossible the act seems", feedback: "It's a gesture with no human logic: raising a staff at a sea. Even so, you obey, and the sea itself responds." },
        ],
      },
      {
        text: "The people walk on dry ground, with walls of water on both sides. The Egyptian army follows them into the open sea.",
        choices: [
          { label: "Stretch out your hand again when God tells you to, so the sea returns", feedback: "When the last Israelite crosses, you stretch out your hand once more. The sea returns to its place over the army that was chasing them." },
          { label: "Watch in awe as they cross, not yet knowing how it will end", feedback: "You watch the water held up like invisible walls and can't help the awe you feel. When everyone has crossed, you obey God's final instruction." },
        ],
      },
    ],
    ending: "The sea returns to its place and covers the entire Egyptian army. Israel sees God's salvation that day. Miriam takes a tambourine and all the women sing and dance for joy on the shore.",
    reflection: "Caught between the people's fear and the approaching army, Moses had no human way out — only the obedience of stretching out his hand when God asked. Sometimes deliverance comes at the exact point where you've run out of your own options.",
  },
  {
    id: "david-goliath",
    character: "David",
    tierColor: "#e07a5f",
    title: "David and Goliath",
    ref: "1 Samuel 17",
    intro: "You are David, a young shepherd who has come to bring food to your brothers on the battlefield. The armies of Israel and the Philistines stand facing each other, frozen, because every morning the giant Goliath — nearly 9 feet tall — comes out to challenge anyone who dares face him.",
    scenes: [
      {
        text: "You hear Goliath shout his insults against the God of Israel for the fortieth time. No one in the army dares respond. You feel something the seasoned soldiers don't seem to feel.",
        choices: [
          { label: "Feel indignant: 'Who is this uncircumcised Philistine to defy the living God?'", feedback: "It's not arrogance: you're seeing the problem from a different angle. It isn't Israel against Goliath; it's Goliath against the living God." },
          { label: "Feel afraid seeing the giant, but decide to speak up anyway", feedback: "The fear is real — Goliath is imposing — but you decide fear won't have the final word. You go to speak with King Saul." },
        ],
      },
      {
        text: "King Saul offers you his own armor: a bronze helmet, chain mail, a sword. You put it on, take a few steps... and can barely move.",
        choices: [
          { label: "Take off the armor and trust what you already know: your sling", feedback: "'I cannot walk in this, for I have not tested it,' you tell the king. You take off the borrowed armor and pick up your staff, your sling, and five smooth stones from the stream." },
          { label: "Worry whether refusing the king's armor is disrespectful", feedback: "For a moment you worry about what Saul will think. But you know fighting with tools you don't know how to use would be more dangerous than trusting what's yours." },
        ],
      },
      {
        text: "Goliath sees you approaching and mocks you: you're just a boy with a staff. He advances toward you armed with a sword, a spear, and a javelin.",
        choices: [
          { label: "Run toward him with confidence: 'You come with a sword, I come in the name of the Lord'", feedback: "You run toward the battle line, take a stone from your bag, put it in your sling, and hurl it with all your strength and precision." },
          { label: "Feel the weight of the moment but move forward anyway", feedback: "Your heart pounds hard, but your hands already know this motion from a thousand afternoons of shepherding. You throw the stone without hesitation." },
        ],
      },
    ],
    ending: "The stone strikes Goliath right in the forehead, and the giant falls to the ground. You run, take his own sword, and the Philistine army flees at the sight of their fallen champion. Israel wins a great victory that day.",
    reflection: "David didn't win with borrowed armor or by pretending to be someone bigger: he won with what he already knew, put in service of a trust that went beyond his own size.",
  },
  {
    id: "daniel-lions",
    character: "Daniel",
    tierColor: "#9b5de5",
    title: "The Lions' Den",
    ref: "Daniel 6",
    intro: "You are Daniel, a high official of King Darius, so honest that your rivals can't find any fault in your work to accuse you of. So they decide to attack your faith instead: they convince the king to sign a decree banning prayer to any god except the king himself, for 30 days. Whoever disobeys will be thrown into the lions' den.",
    scenes: [
      {
        text: "You learn of the freshly signed decree. You know exactly what it means to keep praying by your window facing Jerusalem, as you've done three times a day for years.",
        choices: [
          { label: "Keep praying exactly as always, with the window open, without hiding", feedback: "You change nothing about your prayer routine. It isn't an act of provocation: it's simply who you are, decree or no decree." },
          { label: "Consider, just for a moment, praying privately to avoid the risk", feedback: "For an instant you think about how reasonable it would be to pray in secret. But you decide that hiding your faith out of fear would be giving the decree something it doesn't deserve." },
        ],
      },
      {
        text: "Your rivals catch you praying and rush to accuse you before King Darius. The king, distressed, realizes he was manipulated, but the law of the kingdom cannot be revoked.",
        choices: [
          { label: "Stay calm and trusting as they take you to the den", feedback: "There's no panic in you. You know whom you have trusted your whole life, and that trust doesn't depend on what happens tonight." },
          { label: "Feel the weight of the moment as they seal the stone over the den", feedback: "You hear the stone seal over the den and the weight of the situation is real. Even so, your trust isn't based on escaping danger, but on God himself." },
        ],
      },
      {
        text: "You spend the whole night in the den, surrounded by hungry lions.",
        choices: [
          { label: "Trust that God can shut the lions' mouths, as he has done before for others", feedback: "The lions are there, but they don't come near you. You spend the night in a calm that has no human explanation." },
          { label: "Live that night as the longest of your life, holding on to prayer", feedback: "Every hour feels endless. But you keep praying, just as you always have, and you wake up alive." },
        ],
      },
    ],
    ending: "At dawn, the king runs to the den and cries out anxiously, asking whether your God has rescued you. You answer: 'My God sent his angel, and shut the lions' mouths.' You don't have a single scratch. King Darius orders that everyone in the kingdom fear the God of Daniel.",
    reflection: "Daniel didn't change his routine of faith out of fear of a human decree — and that quiet consistency, kept up for years before that night, is what held him up when the greatest test came.",
  },
  {
    id: "jonah",
    character: "Jonah",
    tierColor: "#00bbf9",
    title: "The Great Fish",
    ref: "Jonah 1–4",
    intro: "You are Jonah, a prophet of Israel. God has given you a clear order: go to Nineveh, the great enemy city, and announce its judgment. But Nineveh is the capital of Assyria, the people you hate most, and you don't want them to repent and be forgiven.",
    scenes: [
      {
        text: "Instead of going to Nineveh, you buy passage on a ship to Tarshish, in the exact opposite direction.",
        choices: [
          { label: "Flee anyway, even though you know you can't escape God", feedback: "Deep down you know this makes no sense — but resentment speaks louder than reason right now, and you board the ship." },
          { label: "Feel the weight of disobedience as you leave the harbor", feedback: "As the ship pulls away, you feel something isn't right. But you decide to go on anyway, trying to quiet that unease." },
        ],
      },
      {
        text: "A violent storm hits the ship. The terrified sailors cast lots to find out who caused this disaster — and it falls on you.",
        choices: [
          { label: "Confess the truth: 'I am fleeing the God who made the sea and the dry land'", feedback: "You tell them the whole truth, no excuses. And you ask them to throw you into the sea so the storm will calm, so as not to risk their lives." },
          { label: "Hesitate before confessing, knowing what they'll probably ask to do with you", feedback: "It's hard to admit, but you end up telling the whole truth. You know what comes next, and you accept it anyway." },
        ],
      },
      {
        text: "They throw you into the sea. The storm calms instantly. But instead of drowning, a great fish swallows you, and you spend three days and three nights inside it.",
        choices: [
          { label: "Pray from the bottom of the sea, recognizing God's mercy even in the punishment", feedback: "From the belly of the fish, you pray. You recognize that you fled, but also that salvation belongs to the Lord." },
          { label: "Spend those three days reflecting in silence before you can pray", feedback: "At first the shock is total. But as the hours pass in the dark, you end up crying out to God from that impossible place." },
        ],
      },
    ],
    ending: "The fish vomits you out onto dry land. This time you go to Nineveh and preach the message. The whole city repents, from the king to the last citizen, and God decides not to destroy it. You get angry at God's mercy toward your enemies, and God asks you patiently: 'Is it right for you to be so angry?'",
    reflection: "Jonah obeyed in the end, but he was still wrestling inside with the idea that God could show mercy to people he considered unworthy of it — a reminder that outward obedience doesn't always resolve the heart's struggles right away.",
  },
  {
    id: "esther",
    character: "Esther",
    tierColor: "#845ec2",
    title: "For Such a Time as This",
    ref: "Esther 4–7",
    intro: "You are Esther, queen of Persia, but no one in the palace knows you are Jewish. Haman, the second most powerful man in the empire, has gotten the king to sign a decree to exterminate all the Jews in the kingdom in a single day. Your cousin Mordecai begs you to speak to the king.",
    scenes: [
      {
        text: "Mordecai tells you: 'Perhaps you have come to the kingdom for such a time as this.' But approaching the king unsummoned could cost you your life — it's the law of the palace, even for the queen.",
        choices: [
          { label: "Decide to speak up, even though the risk is real: 'If I perish, I perish'", feedback: "You ask everyone to fast with you for three days before acting. You decide the risk of staying silent is greater than the risk of speaking." },
          { label: "Feel genuine fear at the possibility of losing your life", feedback: "The fear is honest and real — risking your life isn't a whim — but you decide protecting your people outweighs your own safety." },
        ],
      },
      {
        text: "You appear before the king without being summoned. He extends his golden scepter toward you — a sign you won't be punished — and asks what you wish.",
        choices: [
          { label: "Act with patience and strategy, inviting the king and Haman to a banquet first", feedback: "Instead of accusing right away, you invite the king and Haman to a banquet. You know the timing and manner of telling the truth matter as much as the truth itself." },
          { label: "Feel the urge to say everything at once, but choose to wait", feedback: "Everything in you wants to say it now, but you choose patience. You prepare a second banquet before revealing what's at stake." },
        ],
      },
      {
        text: "At the second banquet, with the king and Haman present, the moment to speak arrives.",
        choices: [
          { label: "Reveal the truth courageously: 'My people have been sold for destruction, and I am a Jew'", feedback: "You speak clearly, with no hedging. The king is furious to discover Haman's plot against your people — and against you." },
          { label: "Gather your courage in the very moment of speaking, feeling the weight of each word", feedback: "Your heart pounds, but the words come out firm: you tell the king exactly what Haman has planned." },
        ],
      },
    ],
    ending: "The king orders Haman executed on the very gallows he had prepared for Mordecai. A new decree is issued allowing the Jews to defend themselves. Your people are saved, and to this day the feast of Purim is celebrated in memory of this deliverance.",
    reflection: "Esther didn't act out of impulse or paralyzing fear: she acted with courage and strategic patience at the same time, understanding that the timing of speaking up can matter as much as the courage to do it.",
  },
  {
    id: "peter-restoration",
    character: "Peter",
    tierColor: "#f15bb5",
    title: "Denial and Restoration",
    ref: "Matthew 26; John 21",
    intro: "You are Peter, one of Jesus' closest disciples. Hours ago you promised him you would never abandon him, even if you had to die with him. Now Jesus has been arrested, and you follow him at a distance into the high priest's courtyard.",
    scenes: [
      {
        text: "A servant girl looks at you by the fire and says, 'You also were with Jesus the Galilean.' You feel every eye in the courtyard on you.",
        choices: [
          { label: "Deny it out of fear: 'I don't know what you're talking about'", feedback: "The words come out before you can stop them. The fear in that courtyard is stronger than you imagined it would be." },
          { label: "Hesitate for an instant before denying it, feeling the inner conflict", feedback: "For a split second you think about telling the truth. But fear wins this time, and you deny knowing him." },
        ],
      },
      {
        text: "Two more people recognize you and accuse you of being one of the disciples. Each time you deny it more forcefully, until you swear you don't know Jesus.",
        choices: [
          { label: "Feel each denial pulling you down further, unable to stop", feedback: "It's like a fall you can't brake. Each denial pulls you further from who you truly want to be." },
          { label: "Notice the growing weight of your own words as you say them", feedback: "Even as you speak, part of you watches in horror at what's coming out of your mouth." },
        ],
      },
      {
        text: "Right then, a rooster crows. Jesus, being led across the courtyard, turns and looks straight into your eyes.",
        choices: [
          { label: "Remember Jesus' warning and go out to weep bitterly", feedback: "Jesus' look isn't one of condemnation, but of shared sorrow. You go outside and cry like you never have before." },
          { label: "Feel shame and heartbreak as your eyes meet his", feedback: "That exchanged look lasts only an instant, but it marks you forever. You leave the courtyard shattered inside." },
        ],
      },
    ],
    ending: "Days after the resurrection, by the Sea of Galilee, Jesus asks you three times — once for each denial — 'Do you love me?' Each time you answer yes, and each time Jesus entrusts you with a task: 'Feed my sheep.' There's no final rebuke, only restoration and a new mission.",
    reflection: "Peter's story doesn't end in denial, but in restoration: Jesus didn't cast aside someone who had failed so publicly — instead he gave back to him, one by one, exactly what he had denied.",
  },
];
