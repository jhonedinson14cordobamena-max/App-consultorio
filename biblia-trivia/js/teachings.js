/**
 * Enseñanzas bíblicas y retos de aplicación práctica.
 *
 * Propósito del juego: traer lo que ocurrió en el pasado bíblico al
 * presente, para que el jugador pueda aplicarlo hoy y en el futuro.
 * Por eso cada enseñanza sigue la misma estructura:
 *   1) "lesson"      -> qué hizo el personaje EN EL PASADO (el hecho bíblico).
 *   2) "application" -> cómo llevar ESE MISMO ejemplo al PRESENTE y al FUTURO.
 *   3) "challenge"   -> un reto de opción múltiple para practicar esa
 *                       aplicación en una situación de la vida real.
 *
 * Al superar un nivel, el jugador recibe una enseñanza al azar del tier
 * correspondiente, y gana puntos extra por elegir la mejor aplicación.
 */

const TEACHINGS_ES = {
  1: [
    {
      lesson: "En el pasado, Dios creó todo con orden y descansó al séptimo día, dejando un ejemplo de ritmo entre el trabajo y el descanso.",
      application: "Hoy y en el futuro, aplica ese mismo ejemplo apartando un tiempo regular de descanso para renovar cuerpo y espíritu, en vez de vivir siempre acelerado.",
      challenge: {
        q: "Llevas semanas trabajando sin parar y te sientes agotado. Según el ejemplo del descanso, ¿qué es lo más sabio?",
        options: ["Seguir sin parar para rendir más", "Apartar un tiempo de descanso real esta semana", "Ignorar el cansancio hasta terminar todo"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, Adán y Eva enfrentaron consecuencias por desobedecer, pero Dios ya tenía preparado un plan de redención para ellos.",
      application: "Hoy y en el futuro, cuando falles, reconoce el error con honestidad en vez de esconderlo, confiando en que siempre hay una nueva oportunidad.",
      challenge: {
        q: "Cometiste un error importante y tu primer impulso es ocultarlo. ¿Qué harías siguiendo esta enseñanza?",
        options: ["Ocultarlo y esperar que nadie lo note", "Reconocerlo con honestidad y buscar cómo repararlo", "Culpar a otra persona"],
        correct: 1,
      },
    },
  ],
  2: [
    {
      lesson: "En el pasado, Abraham confió en Dios y salió hacia una tierra desconocida sin saber exactamente a dónde iba.",
      application: "Hoy y en el futuro, cuando la vida te llame a un cambio incierto pero correcto, da el paso de fe en lugar de aferrarte solo a lo seguro y conocido.",
      challenge: {
        q: "Te ofrecen una oportunidad buena pero incierta, y sientes miedo de dejar tu zona de comodidad. ¿Qué reflejaría la fe de Abraham?",
        options: ["Rechazarla por miedo a lo desconocido", "Evaluarla con sabiduría y dar el paso de fe si es correcta", "Esperar una garantía total antes de decidir cualquier cosa"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, José perdonó a sus hermanos que lo vendieron como esclavo, reconociendo un propósito de Dios incluso en el mal que le hicieron.",
      application: "Hoy y en el futuro, practica ese mismo perdón hacia quien te ha dañado, buscando el bien que puede surgir en lugar de guardar rencor.",
      challenge: {
        q: "Alguien cercano te traicionó hace tiempo y ahora necesita tu ayuda. ¿Qué haría alguien que sigue el ejemplo de José?",
        options: ["Negarle la ayuda por venganza", "Ayudarlo, ofreciendo perdón genuino", "Ayudarlo solo para hacerlo sentir culpable"],
        correct: 1,
      },
    },
  ],
  3: [
    {
      lesson: "En el pasado, Moisés dudaba de sus propias capacidades, pero Dios lo usó poderosamente a pesar de sus limitaciones.",
      application: "Hoy y en el futuro, no dejes que el sentimiento de 'no soy suficiente' te impida actuar cuando sientes el llamado a hacer algo bueno.",
      challenge: {
        q: "Te piden liderar un proyecto importante pero sientes que no estás preparado. ¿Qué enseña el ejemplo de Moisés?",
        options: ["Rechazarlo por sentirte incapaz", "Aceptarlo con humildad, buscando ayuda y confiando en el proceso", "Aceptarlo solo si te sientes 100% seguro"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, Dios entregó los Diez Mandamientos para darle al pueblo un marco claro de cómo amar a Dios y tratar bien al prójimo.",
      application: "Hoy y en el futuro, revisa tus decisiones diarias preguntándote si honran a Dios y respetan a las personas a tu alrededor.",
      challenge: {
        q: "Estás por tomar una decisión que te beneficia pero perjudica a otra persona. ¿Qué harías aplicando esta enseñanza?",
        options: ["Seguir adelante porque te conviene", "Buscar una alternativa que no dañe a otros", "Ignorar el efecto sobre los demás"],
        correct: 1,
      },
    },
  ],
  4: [
    {
      lesson: "En el pasado, David enfrentó a Goliat confiando en Dios y no en su propia fuerza ni en una armadura ajena.",
      application: "Hoy y en el futuro, ante un problema que parece un 'gigante', enfrenta el miedo con fe y preparación en lugar de paralizarte por su tamaño.",
      challenge: {
        q: "Tienes un desafío enorme por delante y sientes que no tienes las herramientas 'perfectas'. ¿Qué harías como David?",
        options: ["Rendirte porque el desafío es demasiado grande", "Enfrentarlo con lo que sí tienes, confiando y preparándote", "Esperar tener el equipo perfecto antes de intentarlo"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, David cayó en un pecado grave, pero se arrepintió sinceramente cuando el profeta Natán lo confrontó.",
      application: "Hoy y en el futuro, cuando alguien te confronte con la verdad sobre un error, recíbelo con humildad en vez de defenderte o negarlo.",
      challenge: {
        q: "Un amigo te señala con respeto un error que cometiste. ¿Cuál sería la respuesta más sabia?",
        options: ["Negarlo y enojarte con esa persona", "Escuchar, reconocer el error y corregirlo", "Ignorar el comentario por completo"],
        correct: 1,
      },
    },
  ],
  5: [
    {
      lesson: "En el pasado, Job mantuvo su integridad y su confianza en Dios en medio de un sufrimiento que no podía explicar.",
      application: "Hoy y en el futuro, en tiempos difíciles, sostén tu confianza en el carácter de Dios aunque no entiendas por qué ocurren las cosas.",
      challenge: {
        q: "Atraviesas una situación muy dolorosa y no encuentras explicación. ¿Qué enseña el ejemplo de Job?",
        options: ["Abandonar la fe porque 'no tiene sentido'", "Sostener la confianza en Dios mientras procesas el dolor", "Fingir que no te afecta nada"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, Salomón enseñó en los Proverbios que la sabiduría comienza con reverenciar a Dios y se practica en decisiones cotidianas.",
      application: "Hoy y en el futuro, antes de una decisión importante, pregúntate si el camino que eliges honra a Dios y beneficia a otros a largo plazo.",
      challenge: {
        q: "Tienes dos opciones: una fácil pero deshonesta, otra difícil pero correcta. ¿Qué elegirías según esta enseñanza?",
        options: ["La fácil, aunque sea deshonesta", "La difícil, pero correcta y honesta", "La que te dé más beneficio inmediato sin pensar más"],
        correct: 1,
      },
    },
  ],
  6: [
    {
      lesson: "En el pasado, Daniel y sus amigos se negaron a comprometer su fe incluso bajo la presión del rey más poderoso de su tiempo.",
      application: "Hoy y en el futuro, mantente firme en tus valores incluso cuando el entorno o la presión social empujen en otra dirección.",
      challenge: {
        q: "Tus compañeros insisten en que hagas algo que va contra tus valores. ¿Qué haría alguien como Daniel?",
        options: ["Ceder para no destacar", "Mantenerse firme con respeto, aunque sea incómodo", "Fingir estar de acuerdo pero hacerlo a escondidas"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, Jonás intentó huir de la misión que Dios le dio, y aprendió que no podía escapar de su llamado ni negar la misericordia de Dios hacia otros.",
      application: "Hoy y en el futuro, no huyas de una responsabilidad incómoda que sabes que debes cumplir, y sé generoso con la misericordia hacia quienes 'no la merecen'.",
      challenge: {
        q: "Debes disculparte o ayudar a alguien que consideras que 'no se lo merece'. ¿Qué enseña la historia de Jonás?",
        options: ["Evitarlo porque no lo merece", "Hacerlo de todas formas, con un corazón dispuesto", "Hacerlo solo a medias para cumplir"],
        correct: 1,
      },
    },
  ],
  7: [
    {
      lesson: "En el pasado, Jesús nació en humildad, no en riqueza ni poder, mostrando que la grandeza de Dios no depende de las apariencias.",
      application: "Hoy y en el futuro, valora a las personas y a ti mismo por el carácter, no por el estatus social, el dinero o la apariencia.",
      challenge: {
        q: "Conoces a alguien humilde, sin recursos, pero de gran carácter. ¿Cómo lo tratarías según esta enseñanza?",
        options: ["Con menos atención por su condición", "Con el mismo respeto y valor que a cualquiera", "Ignorándolo si no aporta beneficio"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, Jesús resistió la tentación en el desierto apoyándose en la Palabra de Dios, no solo en su propia fuerza de voluntad.",
      application: "Hoy y en el futuro, cuando enfrentes una tentación, apóyate en principios y verdades sólidas en vez de confiar únicamente en tu fuerza de voluntad.",
      challenge: {
        q: "Sientes la tentación de hacer algo que sabes que está mal. ¿Qué harías siguiendo el ejemplo de Jesús?",
        options: ["Confiar solo en 'ser fuerte' en el momento", "Recordar tus principios y buscar apoyo o distancia de la tentación", "Ceder 'solo esta vez'"],
        correct: 1,
      },
    },
  ],
  8: [
    {
      lesson: "En el pasado, el buen samaritano ayudó a un desconocido herido cuando otros religiosos pasaron de largo; el amor al prójimo se demuestra en acción.",
      application: "Hoy y en el futuro, la próxima vez que veas a alguien en necesidad, actúa para ayudar aunque no sea 'tu problema' o no conozcas a la persona.",
      challenge: {
        q: "Ves a alguien necesitando ayuda en la calle y no lo conoces de nada. ¿Qué haría el buen samaritano?",
        options: ["Pasar de largo porque no es asunto tuyo", "Detenerte y ayudar en lo que puedas", "Ayudar solo si te lo agradece después"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, el padre del hijo pródigo lo recibió con alegría en lugar de reproche cuando este regresó arrepentido.",
      application: "Hoy y en el futuro, cuando alguien cercano se equivoque y busque reconciliarse, recíbelo con gracia en lugar de guardar rencor.",
      challenge: {
        q: "Un familiar que te decepcionó antes ahora busca reconciliarse sinceramente. ¿Qué harías como el padre de la parábola?",
        options: ["Rechazarlo para que 'aprenda la lección'", "Recibirlo con gracia y darle una nueva oportunidad", "Aceptarlo pero recordándole el error constantemente"],
        correct: 1,
      },
    },
  ],
  9: [
    {
      lesson: "En el pasado, los primeros cristianos compartían lo que tenían y se cuidaban unos a otros como una verdadera comunidad.",
      application: "Hoy y en el futuro, busca maneras concretas de apoyar a tu comunidad (tiempo, recursos, atención) en lugar de vivir solo para ti mismo.",
      challenge: {
        q: "Sabes que alguien de tu comunidad está pasando necesidad. ¿Qué reflejaría el espíritu de la iglesia primitiva?",
        options: ["No involucrarte porque no es tu responsabilidad", "Ofrecer ayuda concreta dentro de tus posibilidades", "Esperar a que alguien más se encargue"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, Pablo pasó de perseguir a los cristianos a ser uno de los mayores misioneros, mostrando que nadie está fuera del alcance de un cambio genuino.",
      application: "Hoy y en el futuro, no etiquetes a alguien como 'perdido para siempre'; da espacio para que las personas cambien de verdad.",
      challenge: {
        q: "Alguien con un pasado muy negativo muestra ahora un cambio genuino. ¿Qué actitud refleja la historia de Pablo?",
        options: ["Seguir juzgándolo por su pasado", "Darle una oportunidad real, reconociendo su cambio", "Dudar siempre de su sinceridad sin darle chance"],
        correct: 1,
      },
    },
  ],
  10: [
    {
      lesson: "En el pasado, Pablo describió el amor en 1 Corintios 13 como paciente, bondadoso, no egoísta, y que todo lo soporta.",
      application: "Hoy y en el futuro, en tus relaciones cercanas, practica esa misma paciencia y pon las necesidades del otro por delante del orgullo propio.",
      challenge: {
        q: "Estás en un desacuerdo con alguien cercano y ambos tienen algo de razón. ¿Qué refleja el 'amor' de 1 Corintios 13?",
        options: ["Insistir en tener la razón a toda costa", "Escuchar con paciencia y buscar entendimiento mutuo", "Ignorar a la otra persona hasta que se le pase"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, Pablo enseñó que el fruto del Espíritu (amor, gozo, paz, paciencia...) describe un carácter que se cultiva con el tiempo, no un logro instantáneo.",
      application: "Hoy y en el futuro, elige una cualidad del fruto del Espíritu que te cueste más, como la paciencia, y practícala intencionalmente esta semana.",
      challenge: {
        q: "Notas que te cuesta mucho ser paciente en el tráfico o en filas largas. ¿Qué harías para cultivar ese fruto?",
        options: ["Aceptar que 'así eres' y no cambiar nada", "Practicar conscientemente la calma en esas situaciones", "Evitar por completo cualquier situación que requiera paciencia"],
        correct: 1,
      },
    },
  ],
  11: [
    {
      lesson: "En el pasado, las cartas a las siete iglesias mostraron que Dios valora la fidelidad constante más que una buena reputación externa.",
      application: "Hoy y en el futuro, evalúa si tu compromiso con lo que crees es real y constante, no solo una apariencia para los demás.",
      challenge: {
        q: "Te das cuenta de que actúas 'bien' solo cuando otros te observan. ¿Qué enseña esta reflexión sobre las siete iglesias?",
        options: ["No importa, mientras parezca bien ante los demás", "Buscar que tu integridad sea real, se vea o no se vea", "Cambiar de comportamiento según quién te mire"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado (en la visión profética de Juan), Apocalipsis terminó anunciando una restauración total: el mal y el sufrimiento no tienen la última palabra.",
      application: "Hoy y en el futuro, en medio de circunstancias difíciles, sostén la esperanza de que la situación puede mejorar, y actúa hoy con esa esperanza.",
      challenge: {
        q: "Atraviesas una etapa difícil y sientes que no hay salida. ¿Qué actitud refleja esta enseñanza?",
        options: ["Resignarte a que nada puede mejorar", "Mantener la esperanza y dar pasos concretos hoy", "Esperar pasivamente sin hacer nada"],
        correct: 1,
      },
    },
  ],
  12: [
    {
      lesson: "En el pasado, Ester actuó con valentía en un momento decisivo, arriesgando su posición para proteger a su pueblo.",
      application: "Hoy y en el futuro, cuando tengas una oportunidad única de hacer el bien, aunque implique riesgo personal, considera que quizás estás ahí 'para un momento como este'.",
      challenge: {
        q: "Tienes la oportunidad de defender a alguien injustamente tratado, pero podría costarte popularidad. ¿Qué haría Ester?",
        options: ["Callar para no arriesgar tu posición", "Hablar con valentía a pesar del riesgo", "Esperar a que otro lo haga primero"],
        correct: 1,
      },
    },
    {
      lesson: "En el pasado, Nehemías organizó y perseveró para reconstruir algo roto —el muro de Jerusalén— a pesar de la oposición externa.",
      application: "Hoy y en el futuro, ante un proyecto importante que enfrenta obstáculos, sé constante y organiza pasos concretos en lugar de rendirte.",
      challenge: {
        q: "Un proyecto importante para ti enfrenta críticas y obstáculos constantes. ¿Qué haría Nehemías?",
        options: ["Abandonar el proyecto ante la primera crítica", "Perseverar con un plan claro, paso a paso", "Seguir solo si nadie se opone"],
        correct: 1,
      },
    },
  ],
};

const TEACHINGS_EN = {
  1: [
    {
      lesson: "In the past, God created everything with order and rested on the seventh day, leaving an example of rhythm between work and rest.",
      application: "Today and in the future, apply that same example by setting aside regular time to rest and renew body and spirit, instead of always living at full speed.",
      challenge: {
        q: "You've been working nonstop for weeks and feel exhausted. Following the example of rest, what's the wisest choice?",
        options: ["Keep going nonstop to get more done", "Set aside real rest time this week", "Ignore the exhaustion until everything is finished"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, Adam and Eve faced consequences for disobeying, but God already had a plan of redemption prepared for them.",
      application: "Today and in the future, when you fail, admit the mistake honestly instead of hiding it, trusting that there is always a new chance.",
      challenge: {
        q: "You made a serious mistake and your first instinct is to hide it. What would this teaching lead you to do?",
        options: ["Hide it and hope no one notices", "Admit it honestly and look for a way to make it right", "Blame someone else"],
        correct: 1,
      },
    },
  ],
  2: [
    {
      lesson: "In the past, Abraham trusted God and set out for an unknown land without knowing exactly where he was going.",
      application: "Today and in the future, when life calls you toward an uncertain but right change, take the step of faith instead of clinging only to what's safe and familiar.",
      challenge: {
        q: "You're offered a good but uncertain opportunity, and you're afraid to leave your comfort zone. What would reflect Abraham's faith?",
        options: ["Reject it out of fear of the unknown", "Evaluate it wisely and take the step of faith if it's right", "Wait for a total guarantee before deciding anything"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, Joseph forgave his brothers who had sold him into slavery, recognizing God's purpose even in the harm they caused him.",
      application: "Today and in the future, practice that same forgiveness toward those who have hurt you, looking for the good that can come from it instead of holding a grudge.",
      challenge: {
        q: "Someone close to you betrayed you a while ago and now needs your help. What would someone following Joseph's example do?",
        options: ["Refuse to help out of revenge", "Help them, offering genuine forgiveness", "Help them only to make them feel guilty"],
        correct: 1,
      },
    },
  ],
  3: [
    {
      lesson: "In the past, Moses doubted his own abilities, but God used him powerfully despite his limitations.",
      application: "Today and in the future, don't let the feeling of 'I'm not enough' stop you from acting when you feel called to do something good.",
      challenge: {
        q: "You're asked to lead an important project but feel unprepared. What does Moses' example teach?",
        options: ["Turn it down because you feel incapable", "Accept it with humility, seeking help and trusting the process", "Accept it only if you feel 100% sure"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, God gave the Ten Commandments to give the people a clear framework for loving God and treating others well.",
      application: "Today and in the future, examine your daily decisions by asking whether they honor God and respect the people around you.",
      challenge: {
        q: "You're about to make a decision that benefits you but harms someone else. What would applying this teaching look like?",
        options: ["Go ahead because it benefits you", "Look for an alternative that doesn't harm others", "Ignore the effect on others"],
        correct: 1,
      },
    },
  ],
  4: [
    {
      lesson: "In the past, David faced Goliath trusting in God, not in his own strength or someone else's armor.",
      application: "Today and in the future, when facing a problem that feels like a 'giant', face the fear with faith and preparation instead of freezing because of its size.",
      challenge: {
        q: "You have a huge challenge ahead and feel you don't have the 'perfect' tools. What would you do like David?",
        options: ["Give up because the challenge is too big", "Face it with what you do have, trusting and preparing", "Wait until you have the perfect setup before trying"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, David fell into serious sin, but repented sincerely when the prophet Nathan confronted him.",
      application: "Today and in the future, when someone confronts you with the truth about a mistake, receive it with humility instead of getting defensive or denying it.",
      challenge: {
        q: "A friend respectfully points out a mistake you made. What would be the wisest response?",
        options: ["Deny it and get angry at that person", "Listen, admit the mistake, and correct it", "Ignore the comment completely"],
        correct: 1,
      },
    },
  ],
  5: [
    {
      lesson: "In the past, Job kept his integrity and his trust in God amid suffering he could not explain.",
      application: "Today and in the future, in difficult times, hold on to your trust in God's character even when you don't understand why things happen.",
      challenge: {
        q: "You're going through a very painful situation and can't find an explanation. What does Job's example teach?",
        options: ["Abandon your faith because 'it makes no sense'", "Hold on to trust in God while you process the pain", "Pretend it doesn't affect you at all"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, Solomon taught in Proverbs that wisdom begins with reverence for God and is practiced in everyday decisions.",
      application: "Today and in the future, before an important decision, ask yourself whether the path you choose honors God and benefits others in the long run.",
      challenge: {
        q: "You have two options: an easy but dishonest one, and a hard but right one. Which would you choose based on this teaching?",
        options: ["The easy one, even if it's dishonest", "The hard one, but honest and right", "Whichever gives you the most immediate benefit, without thinking further"],
        correct: 1,
      },
    },
  ],
  6: [
    {
      lesson: "In the past, Daniel and his friends refused to compromise their faith even under pressure from the most powerful king of their time.",
      application: "Today and in the future, stay firm in your values even when your surroundings or social pressure push you the other way.",
      challenge: {
        q: "Your peers insist you do something that goes against your values. What would someone like Daniel do?",
        options: ["Give in so you don't stand out", "Stand firm respectfully, even if it's uncomfortable", "Pretend to agree but do it in secret anyway"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, Jonah tried to run from the mission God gave him, and learned that he could not escape his calling nor deny God's mercy toward others.",
      application: "Today and in the future, don't run from an uncomfortable responsibility you know you must fulfill, and be generous with mercy toward those who 'don't deserve it'.",
      challenge: {
        q: "You need to apologize to or help someone you feel 'doesn't deserve it'. What does Jonah's story teach?",
        options: ["Avoid it because they don't deserve it", "Do it anyway, with a willing heart", "Do it only halfway just to get it over with"],
        correct: 1,
      },
    },
  ],
  7: [
    {
      lesson: "In the past, Jesus was born in humility, not in wealth or power, showing that God's greatness doesn't depend on appearances.",
      application: "Today and in the future, value people — and yourself — for character, not social status, money, or appearance.",
      challenge: {
        q: "You meet someone humble, without resources, but of great character. How would you treat them based on this teaching?",
        options: ["With less attention because of their situation", "With the same respect and worth as anyone else", "Ignoring them if they bring no benefit"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, Jesus resisted temptation in the desert by relying on the Word of God, not just his own willpower.",
      application: "Today and in the future, when you face temptation, rely on solid principles and truths instead of trusting only in your own willpower.",
      challenge: {
        q: "You feel tempted to do something you know is wrong. What would you do following Jesus' example?",
        options: ["Rely only on 'being strong' in the moment", "Remember your principles and seek support or distance from the temptation", "Give in 'just this once'"],
        correct: 1,
      },
    },
  ],
  8: [
    {
      lesson: "In the past, the good Samaritan helped a wounded stranger when other religious people walked past; love for one's neighbor is shown through action.",
      application: "Today and in the future, the next time you see someone in need, act to help even if it's not 'your problem' or you don't know the person.",
      challenge: {
        q: "You see someone needing help on the street and you don't know them at all. What would the good Samaritan do?",
        options: ["Walk past because it's not your business", "Stop and help however you can", "Help only if they thank you afterward"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, the father of the prodigal son welcomed him with joy instead of reproach when he returned repentant.",
      application: "Today and in the future, when someone close to you makes a mistake and seeks reconciliation, welcome them with grace instead of holding a grudge.",
      challenge: {
        q: "A family member who disappointed you before is now sincerely seeking reconciliation. What would you do like the father in the parable?",
        options: ["Reject them so they 'learn their lesson'", "Welcome them with grace and give them a new chance", "Accept them but constantly remind them of the mistake"],
        correct: 1,
      },
    },
  ],
  9: [
    {
      lesson: "In the past, the early Christians shared what they had and looked after one another as a true community.",
      application: "Today and in the future, look for concrete ways to support your community (time, resources, attention) instead of living only for yourself.",
      challenge: {
        q: "You know someone in your community is going through need. What would reflect the spirit of the early church?",
        options: ["Not getting involved because it's not your responsibility", "Offering concrete help within your means", "Waiting for someone else to take care of it"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, Paul went from persecuting Christians to becoming one of the greatest missionaries, showing that no one is beyond the reach of genuine change.",
      application: "Today and in the future, don't label someone as 'forever lost'; leave room for people to truly change.",
      challenge: {
        q: "Someone with a very negative past now shows genuine change. What attitude reflects Paul's story?",
        options: ["Keep judging them for their past", "Give them a real chance, recognizing their change", "Always doubt their sincerity without giving them a chance"],
        correct: 1,
      },
    },
  ],
  10: [
    {
      lesson: "In the past, Paul described love in 1 Corinthians 13 as patient, kind, not self-seeking, and enduring all things.",
      application: "Today and in the future, in your close relationships, practice that same patience and put the other person's needs ahead of your own pride.",
      challenge: {
        q: "You're in a disagreement with someone close to you, and you're both partly right. What reflects the 'love' of 1 Corinthians 13?",
        options: ["Insist on being right no matter what", "Listen patiently and seek mutual understanding", "Ignore the other person until it blows over"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, Paul taught that the fruit of the Spirit (love, joy, peace, patience...) describes a character that is cultivated over time, not an instant achievement.",
      application: "Today and in the future, choose a quality of the fruit of the Spirit that's hardest for you, like patience, and practice it intentionally this week.",
      challenge: {
        q: "You notice it's hard for you to be patient in traffic or long lines. What would you do to cultivate that fruit?",
        options: ["Accept that 'that's just how you are' and change nothing", "Consciously practice calm in those situations", "Avoid entirely any situation that requires patience"],
        correct: 1,
      },
    },
  ],
  11: [
    {
      lesson: "In the past, the letters to the seven churches showed that God values constant faithfulness more than a good outward reputation.",
      application: "Today and in the future, evaluate whether your commitment to what you believe is real and constant, not just an appearance for others.",
      challenge: {
        q: "You realize you only act 'well' when others are watching. What does this reflection on the seven churches teach?",
        options: ["It doesn't matter, as long as it looks good to others", "Seek real integrity, whether seen or not", "Change your behavior depending on who's watching"],
        correct: 1,
      },
    },
    {
      lesson: "In the past (in John's prophetic vision), Revelation ended by announcing a total restoration: evil and suffering do not have the final word.",
      application: "Today and in the future, in the midst of difficult circumstances, hold on to the hope that things can improve, and act today with that hope.",
      challenge: {
        q: "You're going through a hard season and feel there's no way out. What attitude reflects this teaching?",
        options: ["Resign yourself to the idea that nothing can improve", "Hold on to hope and take concrete steps today", "Wait passively without doing anything"],
        correct: 1,
      },
    },
  ],
  12: [
    {
      lesson: "In the past, Esther acted with courage at a decisive moment, risking her position to protect her people.",
      application: "Today and in the future, when you have a unique opportunity to do good, even if it involves personal risk, consider that maybe you're there 'for such a time as this'.",
      challenge: {
        q: "You have the chance to defend someone who's being treated unfairly, but it could cost you popularity. What would Esther do?",
        options: ["Stay silent to avoid risking your position", "Speak up courageously despite the risk", "Wait for someone else to do it first"],
        correct: 1,
      },
    },
    {
      lesson: "In the past, Nehemiah organized and persevered to rebuild something broken — the wall of Jerusalem — despite outside opposition.",
      application: "Today and in the future, when an important project you care about faces obstacles, stay consistent and organize concrete steps instead of giving up.",
      challenge: {
        q: "An important project of yours faces constant criticism and obstacles. What would Nehemiah do?",
        options: ["Abandon the project at the first criticism", "Persevere with a clear, step-by-step plan", "Keep going only if no one objects"],
        correct: 1,
      },
    },
  ],
};
