/**
 * Enseñanzas bíblicas y retos de aplicación práctica.
 * Al superar un nivel, el jugador recibe una breve enseñanza ligada al
 * tema del tier, una sugerencia de aplicación a la vida diaria, y un
 * reto de opción múltiple ("¿cómo la aplicarías?") que otorga puntos
 * extra por elegir la mejor respuesta. Cada tier tiene dos enseñanzas
 * posibles, elegidas al azar, para dar variedad en cada repetición.
 */

const TEACHINGS = {
  1: [
    {
      lesson: "Dios creó todo con orden y propósito, y descansó al séptimo día como ejemplo para nosotros.",
      application: "Aparta un tiempo regular de descanso para renovar cuerpo y espíritu, en vez de vivir siempre acelerado.",
      challenge: {
        q: "Llevas semanas trabajando sin parar y te sientes agotado. Según el ejemplo del descanso, ¿qué es lo más sabio?",
        options: ["Seguir sin parar para rendir más", "Apartar un tiempo de descanso real esta semana", "Ignorar el cansancio hasta terminar todo"],
        correct: 1,
      },
    },
    {
      lesson: "Adán y Eva enfrentaron consecuencias por desobedecer, pero Dios ya tenía un plan de redención para ellos.",
      application: "Cuando falles, reconoce el error con honestidad en vez de esconderlo, confiando en que siempre hay una nueva oportunidad.",
      challenge: {
        q: "Cometiste un error importante y tu primer impulso es ocultarlo. ¿Qué harías siguiendo esta enseñanza?",
        options: ["Ocultarlo y esperar que nadie lo note", "Reconocerlo con honestidad y buscar cómo repararlo", "Culpar a otra persona"],
        correct: 1,
      },
    },
  ],
  2: [
    {
      lesson: "Abraham confió en Dios y salió hacia una tierra desconocida sin saber exactamente a dónde iba.",
      application: "Cuando la vida te llame a un cambio incierto pero correcto, da el paso de fe en lugar de aferrarte solo a lo seguro y conocido.",
      challenge: {
        q: "Te ofrecen una oportunidad buena pero incierta, y sientes miedo de dejar tu zona de comodidad. ¿Qué reflejaría la fe de Abraham?",
        options: ["Rechazarla por miedo a lo desconocido", "Evaluarla con sabiduría y dar el paso de fe si es correcta", "Esperar una garantía total antes de decidir cualquier cosa"],
        correct: 1,
      },
    },
    {
      lesson: "José perdonó a sus hermanos que lo vendieron como esclavo, reconociendo un propósito de Dios incluso en el mal que le hicieron.",
      application: "Practica el perdón hacia quien te ha dañado, buscando el bien que puede surgir de la situación en lugar de guardar rencor.",
      challenge: {
        q: "Alguien cercano te traicionó hace tiempo y ahora necesita tu ayuda. ¿Qué haría alguien que sigue el ejemplo de José?",
        options: ["Negarle la ayuda por venganza", "Ayudarlo, ofreciendo perdón genuino", "Ayudarlo solo para hacerlo sentir culpable"],
        correct: 1,
      },
    },
  ],
  3: [
    {
      lesson: "Moisés dudaba de sus propias capacidades, pero Dios lo usó poderosamente a pesar de sus limitaciones.",
      application: "No dejes que el sentimiento de 'no soy suficiente' te impida actuar cuando sientes el llamado a hacer algo bueno.",
      challenge: {
        q: "Te piden liderar un proyecto importante pero sientes que no estás preparado. ¿Qué enseña el ejemplo de Moisés?",
        options: ["Rechazarlo por sentirte incapaz", "Aceptarlo con humildad, buscando ayuda y confiando en el proceso", "Aceptarlo solo si te sientes 100% seguro"],
        correct: 1,
      },
    },
    {
      lesson: "Los Diez Mandamientos dieron al pueblo un marco claro para amar a Dios y tratar bien al prójimo.",
      application: "Revisa tus decisiones diarias preguntándote si honran a Dios y respetan a las personas a tu alrededor.",
      challenge: {
        q: "Estás por tomar una decisión que te beneficia pero perjudica a otra persona. ¿Qué harías aplicando esta enseñanza?",
        options: ["Seguir adelante porque te conviene", "Buscar una alternativa que no dañe a otros", "Ignorar el efecto sobre los demás"],
        correct: 1,
      },
    },
  ],
  4: [
    {
      lesson: "David enfrentó a Goliat confiando en Dios y no en su propia fuerza o en una armadura ajena.",
      application: "Ante un problema que parece un 'gigante', enfrenta el miedo con fe y preparación en lugar de paralizarte por su tamaño.",
      challenge: {
        q: "Tienes un desafío enorme por delante y sientes que no tienes las herramientas 'perfectas'. ¿Qué harías como David?",
        options: ["Rendirte porque el desafío es demasiado grande", "Enfrentarlo con lo que sí tienes, confiando y preparándote", "Esperar tener el equipo perfecto antes de intentarlo"],
        correct: 1,
      },
    },
    {
      lesson: "David cayó en un pecado grave, pero se arrepintió sinceramente cuando el profeta Natán lo confrontó.",
      application: "Cuando alguien te confronte con la verdad sobre un error, recíbelo con humildad en vez de defenderte o negarlo.",
      challenge: {
        q: "Un amigo te señala con respeto un error que cometiste. ¿Cuál sería la respuesta más sabia?",
        options: ["Negarlo y enojarte con esa persona", "Escuchar, reconocer el error y corregirlo", "Ignorar el comentario por completo"],
        correct: 1,
      },
    },
  ],
  5: [
    {
      lesson: "Job mantuvo su integridad y su confianza en Dios en medio de un sufrimiento que no podía explicar.",
      application: "En tiempos difíciles, sigue confiando en el carácter de Dios aunque no entiendas por qué ocurren las cosas.",
      challenge: {
        q: "Atraviesas una situación muy dolorosa y no encuentras explicación. ¿Qué enseña el ejemplo de Job?",
        options: ["Abandonar la fe porque 'no tiene sentido'", "Sostener la confianza en Dios mientras procesas el dolor", "Fingir que no te afecta nada"],
        correct: 1,
      },
    },
    {
      lesson: "Los Proverbios enseñan que la sabiduría comienza con reverenciar a Dios y se practica en decisiones cotidianas.",
      application: "Antes de una decisión importante, pregúntate si el camino que eliges honra a Dios y beneficia a otros a largo plazo.",
      challenge: {
        q: "Tienes dos opciones: una fácil pero deshonesta, otra difícil pero correcta. ¿Qué elegirías según esta enseñanza?",
        options: ["La fácil, aunque sea deshonesta", "La difícil, pero correcta y honesta", "La que te dé más beneficio inmediato sin pensar más"],
        correct: 1,
      },
    },
  ],
  6: [
    {
      lesson: "Daniel y sus amigos se negaron a comprometer su fe incluso bajo la presión del rey más poderoso de su tiempo.",
      application: "Mantente firme en tus valores incluso cuando el entorno o la presión social empujen en otra dirección.",
      challenge: {
        q: "Tus compañeros insisten en que hagas algo que va contra tus valores. ¿Qué haría alguien como Daniel?",
        options: ["Ceder para no destacar", "Mantenerse firme con respeto, aunque sea incómodo", "Fingir estar de acuerdo pero hacerlo a escondidas"],
        correct: 1,
      },
    },
    {
      lesson: "Jonás intentó huir de la misión que Dios le dio, pero aprendió que no podía escapar de su llamado ni negar la misericordia de Dios hacia otros.",
      application: "No huyas de una responsabilidad incómoda que sabes que debes cumplir, y sé generoso con la misericordia hacia quienes 'no la merecen'.",
      challenge: {
        q: "Debes disculparte o ayudar a alguien que consideras que 'no se lo merece'. ¿Qué enseña la historia de Jonás?",
        options: ["Evitarlo porque no lo merece", "Hacerlo de todas formas, con un corazón dispuesto", "Hacerlo solo a medias para cumplir"],
        correct: 1,
      },
    },
  ],
  7: [
    {
      lesson: "Jesús nació en humildad, no en riqueza ni poder, mostrando que la grandeza de Dios no depende de las apariencias.",
      application: "Valora a las personas y a ti mismo por el carácter, no por el estatus social, el dinero o la apariencia.",
      challenge: {
        q: "Conoces a alguien humilde, sin recursos, pero de gran carácter. ¿Cómo lo tratarías según esta enseñanza?",
        options: ["Con menos atención por su condición", "Con el mismo respeto y valor que a cualquiera", "Ignorándolo si no aporta beneficio"],
        correct: 1,
      },
    },
    {
      lesson: "Jesús resistió la tentación en el desierto apoyándose en la Palabra de Dios, no solo en su propia fuerza de voluntad.",
      application: "Cuando enfrentes una tentación, apóyate en principios y verdades sólidas en vez de confiar únicamente en tu fuerza de voluntad.",
      challenge: {
        q: "Sientes la tentación de hacer algo que sabes que está mal. ¿Qué harías siguiendo el ejemplo de Jesús?",
        options: ["Confiar solo en 'ser fuerte' en el momento", "Recordar tus principios y buscar apoyo o distancia de la tentación", "Ceder 'solo esta vez'"],
        correct: 1,
      },
    },
  ],
  8: [
    {
      lesson: "El buen samaritano ayudó a un desconocido herido cuando otros religiosos pasaron de largo; el amor al prójimo se demuestra en acción.",
      application: "La próxima vez que veas a alguien en necesidad, actúa para ayudar aunque no sea 'tu problema' o no conozcas a la persona.",
      challenge: {
        q: "Ves a alguien necesitando ayuda en la calle y no lo conoces de nada. ¿Qué haría el buen samaritano?",
        options: ["Pasar de largo porque no es asunto tuyo", "Detenerte y ayudar en lo que puedas", "Ayudar solo si te lo agradece después"],
        correct: 1,
      },
    },
    {
      lesson: "El padre del hijo pródigo lo recibió con alegría en lugar de reproche cuando este regresó arrepentido.",
      application: "Cuando alguien cercano se equivoque y busque reconciliarse, recíbelo con gracia en lugar de guardar rencor.",
      challenge: {
        q: "Un familiar que te decepcionó antes ahora busca reconciliarse sinceramente. ¿Qué harías como el padre de la parábola?",
        options: ["Rechazarlo para que 'aprenda la lección'", "Recibirlo con gracia y darle una nueva oportunidad", "Aceptarlo pero recordándole el error constantemente"],
        correct: 1,
      },
    },
  ],
  9: [
    {
      lesson: "Los primeros cristianos compartían lo que tenían y se cuidaban unos a otros como una verdadera comunidad.",
      application: "Busca maneras concretas de apoyar a tu comunidad (tiempo, recursos, atención) en lugar de vivir solo para ti mismo.",
      challenge: {
        q: "Sabes que alguien de tu comunidad está pasando necesidad. ¿Qué reflejaría el espíritu de la iglesia primitiva?",
        options: ["No involucrarte porque no es tu responsabilidad", "Ofrecer ayuda concreta dentro de tus posibilidades", "Esperar a que alguien más se encargue"],
        correct: 1,
      },
    },
    {
      lesson: "Pablo pasó de perseguir a los cristianos a ser uno de los mayores misioneros, mostrando que nadie está fuera del alcance de un cambio genuino.",
      application: "No etiquetes a alguien como 'perdido para siempre'; da espacio para que las personas cambien de verdad.",
      challenge: {
        q: "Alguien con un pasado muy negativo muestra ahora un cambio genuino. ¿Qué actitud refleja la historia de Pablo?",
        options: ["Seguir juzgándolo por su pasado", "Darle una oportunidad real, reconociendo su cambio", "Dudar siempre de su sinceridad sin darle chance"],
        correct: 1,
      },
    },
  ],
  10: [
    {
      lesson: "Pablo describe el amor en 1 Corintios 13 como paciente, bondadoso, no egoísta, y que todo lo soporta.",
      application: "En tus relaciones cercanas, practica la paciencia y pon las necesidades del otro por delante del orgullo propio.",
      challenge: {
        q: "Estás en un desacuerdo con alguien cercano y ambos tienen algo de razón. ¿Qué refleja el 'amor' de 1 Corintios 13?",
        options: ["Insistir en tener la razón a toda costa", "Escuchar con paciencia y buscar entendimiento mutuo", "Ignorar a la otra persona hasta que se le pase"],
        correct: 1,
      },
    },
    {
      lesson: "El fruto del Espíritu (amor, gozo, paz, paciencia...) describe un carácter que se cultiva con el tiempo, no un logro instantáneo.",
      application: "Elige una cualidad del fruto del Espíritu que te cueste más, como la paciencia, y practícala intencionalmente esta semana.",
      challenge: {
        q: "Notas que te cuesta mucho ser paciente en el tráfico o en filas largas. ¿Qué harías para cultivar ese fruto?",
        options: ["Aceptar que 'así eres' y no cambiar nada", "Practicar conscientemente la calma en esas situaciones", "Evitar por completo cualquier situación que requiera paciencia"],
        correct: 1,
      },
    },
  ],
  11: [
    {
      lesson: "Las cartas a las siete iglesias muestran que Dios valora la fidelidad constante más que una buena reputación externa.",
      application: "Evalúa si tu compromiso con lo que crees es real y constante, no solo una apariencia para los demás.",
      challenge: {
        q: "Te das cuenta de que actúas 'bien' solo cuando otros te observan. ¿Qué enseña esta reflexión sobre las siete iglesias?",
        options: ["No importa, mientras parezca bien ante los demás", "Buscar que tu integridad sea real, se vea o no se vea", "Cambiar de comportamiento según quién te mire"],
        correct: 1,
      },
    },
    {
      lesson: "Apocalipsis termina con la esperanza de una restauración total: el mal y el sufrimiento no tienen la última palabra.",
      application: "En medio de circunstancias difíciles, sostén la esperanza de que la situación puede mejorar, y actúa hoy con esa esperanza.",
      challenge: {
        q: "Atraviesas una etapa difícil y sientes que no hay salida. ¿Qué actitud refleja esta enseñanza?",
        options: ["Resignarte a que nada puede mejorar", "Mantener la esperanza y dar pasos concretos hoy", "Esperar pasivamente sin hacer nada"],
        correct: 1,
      },
    },
  ],
  12: [
    {
      lesson: "Ester actuó con valentía en un momento decisivo, arriesgando su posición para proteger a su pueblo.",
      application: "Cuando tengas una oportunidad única de hacer el bien, aunque implique riesgo personal, considera que quizás estás ahí 'para un momento como este'.",
      challenge: {
        q: "Tienes la oportunidad de defender a alguien injustamente tratado, pero podría costarte popularidad. ¿Qué haría Ester?",
        options: ["Callar para no arriesgar tu posición", "Hablar con valentía a pesar del riesgo", "Esperar a que otro lo haga primero"],
        correct: 1,
      },
    },
    {
      lesson: "Nehemías organizó y perseveró para reconstruir algo roto —el muro de Jerusalén— a pesar de la oposición externa.",
      application: "Ante un proyecto importante que enfrenta obstáculos, sé constante y organiza pasos concretos en lugar de rendirte.",
      challenge: {
        q: "Un proyecto importante para ti enfrenta críticas y obstáculos constantes. ¿Qué haría Nehemías?",
        options: ["Abandonar el proyecto ante la primera crítica", "Perseverar con un plan claro, paso a paso", "Seguir solo si nadie se opone"],
        correct: 1,
      },
    },
  ],
};
