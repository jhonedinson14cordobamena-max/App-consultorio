/**
 * Modo bonus: Torá y Leyendas del Talmud.
 *
 * Este modo es GRATIS para todos los jugadores y NO forma parte de los
 * 120 niveles de pago del juego principal — es un espacio adicional para
 * profundizar en el texto de la Torá (los cinco libros de Moisés) y para
 * conocer leyendas tradicionales del Talmud y el Midrash judíos.
 *
 * IMPORTANTE — distinción honesta entre dos tipos de contenido:
 *
 * 1) TORAH_QUESTIONS: preguntas basadas directamente en el texto bíblico
 *    de la Torá (Génesis, Éxodo, Levítico, Números, Deuteronomio), con
 *    referencia exacta de capítulo. Son hechos del texto, igual que el
 *    resto del banco de preguntas del juego.
 *
 * 2) TALMUD_LEGENDS: son leyendas (Hagadá/Aggadah) del Talmud y el
 *    Midrash — la tradición oral rabínica judía. NO son parte del texto
 *    de la Torá ni de la Biblia cristiana; son relatos e interpretaciones
 *    posteriores, transmitidos durante siglos para enseñar lecciones
 *    morales y espirituales. Cada una incluye su fuente exacta (tratado
 *    talmúdico o midrásico) y se marca siempre como "Leyenda del Talmud"
 *    en la interfaz del juego, para no confundirlas con el texto bíblico.
 */

const TORAH_QUESTIONS_ES = [
  { q: "¿Cómo se llama el día más solemne del calendario judío, dedicado a la expiación de los pecados de todo el pueblo?", options: ["Yom Kipur (Día de la Expiación)", "Rosh Hashaná", "Purim", "Janucá"], correct: 0, ref: "Levítico 16", detail: "Era el único día del año en que el sumo sacerdote entraba al Lugar Santísimo del tabernáculo." },
  { q: "¿Cada cuántos años se debía celebrar el Año de Jubileo según Levítico?", options: ["Cada 7 años", "Cada 50 años", "Cada 12 años", "Cada 100 años"], correct: 1, ref: "Levítico 25", detail: "En el Jubileo se liberaban esclavos y las tierras volvían a sus dueños originales." },
  { q: "¿Qué característica debían tener los mamíferos terrestres para considerarse 'puros' y aptos para comer según Levítico 11?", options: ["Tener pezuña hendida y rumiar", "Ser herbívoros", "Vivir en manada", "Tener cuernos"], correct: 0, ref: "Levítico 11", detail: "Por eso el cerdo se consideraba impuro: tiene pezuña hendida pero no rumia." },
  { q: "¿Qué mandamiento de Levítico 19 citó Jesús como el segundo más grande de todos?", options: ["Amarás a tu prójimo como a ti mismo", "No robarás", "Guardarás el sábado", "Honrarás a tus padres"], correct: 0, ref: "Levítico 19:18", detail: "Jesús lo unió al amor a Dios como el resumen de 'toda la Ley y los profetas' (Mateo 22)." },
  { q: "¿Qué frase resume el llamado central a la santidad en el libro de Levítico?", options: ["'Sed santos, porque yo, el Señor, soy santo'", "'Buscad primero el reino de Dios'", "'El justo por la fe vivirá'", "'No hay otro nombre bajo el cielo'"], correct: 0, ref: "Levítico 19:2", detail: "Esta frase se repite varias veces en Levítico como fundamento de todo el 'código de santidad'." },
  { q: "¿Qué les estaba prohibido consumir a los israelitas junto con la carne, por representar la vida del animal?", options: ["La sangre", "La grasa únicamente", "Los huesos", "El hígado"], correct: 0, ref: "Levítico 17", detail: "El texto explica que 'la vida de la carne en la sangre está'." },
  { q: "¿Cuántas fiestas anuales principales establece el calendario religioso de Levítico 23?", options: ["Siete", "Tres", "Doce", "Cinco"], correct: 0, ref: "Levítico 23", detail: "Incluyen la Pascua, los Panes sin Levadura, las Primicias, las Semanas, las Trompetas, la Expiación y los Tabernáculos." },
  { q: "¿Cuántos israelitas varones aptos para la guerra arrojó el primer censo del libro de Números?", options: ["Poco más de 603.000", "Alrededor de 12.000", "Cerca de 1 millón", "Unos 70.000"], correct: 0, ref: "Números 1", detail: "El censo se hizo por tribus, un año después de salir de Egipto." },
  { q: "¿Qué objeto de Aarón floreció y produjo almendras como señal de que Dios lo había escogido como sacerdote?", options: ["Su vara", "Su túnica", "Su cinturón", "Su copa"], correct: 0, ref: "Números 17", detail: "Se colocaron doce varas, una por cada tribu, y solo la de Aarón reverdeció durante la noche." },
  { q: "¿Qué hizo Moisés para sanar a los israelitas mordidos por serpientes venenosas en el desierto?", options: ["Levantó una serpiente de bronce en un asta", "Ofreció un sacrificio de cordero", "Los cubrió con maná", "Los llevó al monte Sinaí"], correct: 0, ref: "Números 21", detail: "Quien miraba la serpiente de bronce sanaba; siglos después Jesús comparó esto con su propia crucifixión (Juan 3:14)." },
  { q: "¿Qué grupo de cinco hermanas pidió y obtuvo el derecho a heredar tierra por no tener hermanos varones?", options: ["Las hijas de Zelofehad", "Las hijas de Labán", "Las hijas de Jetro", "Las hijas de Coré"], correct: 0, ref: "Números 27", detail: "Su caso estableció una nueva ley de herencia para todo Israel cuando una familia no tenía hijos varones." },
  { q: "De toda la generación adulta que salió de Egipto, ¿quiénes fueron los únicos que sí entraron a la Tierra Prometida?", options: ["Josué y Caleb", "Moisés y Aarón", "Finees y Eleazar", "Coré y Datán"], correct: 0, ref: "Números 14 y 26", detail: "El resto de esa generación murió durante los 40 años en el desierto, por no confiar en la promesa de Dios." },
  { q: "¿Cuántos espías en total fueron enviados a explorar la tierra de Canaán?", options: ["Doce, uno por cada tribu", "Dos", "Setenta", "Cuarenta"], correct: 0, ref: "Números 13", detail: "Solo dos de los doce, Josué y Caleb, dieron un informe de confianza en que Dios les daría la tierra." },
  { q: "¿Cómo se llama la declaración central de fe de Israel que comienza 'Oye, Israel: el Señor nuestro Dios, el Señor uno es'?", options: ["El Shemá", "El Kadish", "El Cántico de Moisés", "La Bendición de Aarón"], correct: 0, ref: "Deuteronomio 6:4", detail: "Hasta hoy, esta oración se recita diariamente en la tradición judía, mañana y noche." },
  { q: "¿En qué dos montes se pronunciaron las bendiciones y las maldiciones del pacto al entrar a Canaán?", options: ["Gerizim (bendiciones) y Ebal (maldiciones)", "Sinaí y Horeb", "Carmelo y Tabor", "Sion y Moriah"], correct: 0, ref: "Deuteronomio 27-28", detail: "Seis tribus se pararon en cada monte, con el valle de Siquem entre ambos." },
  { q: "¿Desde qué monte vio Moisés la Tierra Prometida sin poder entrar en ella?", options: ["El monte Nebo", "El monte Sinaí", "El monte Carmelo", "El monte de los Olivos"], correct: 0, ref: "Deuteronomio 34", detail: "Dios le mostró toda la tierra 'desde Galaad hasta Dan', pero Moisés murió allí mismo, en Moab." },
  { q: "¿Cuántos años tenía Moisés cuando murió, según Deuteronomio 34?", options: ["120 años", "80 años", "100 años", "150 años"], correct: 0, ref: "Deuteronomio 34:7", detail: "El texto añade que 'sus ojos nunca se oscurecieron, ni perdió su vigor'." },
  { q: "¿Qué mandamiento resume Deuteronomio 6:5 como la esencia de toda la Ley?", options: ["Amar al Señor con todo el corazón, el alma y las fuerzas", "Guardar el sábado sin excepción", "Ofrecer sacrificios cada mañana", "No comer carne de cerdo"], correct: 0, ref: "Deuteronomio 6:5", detail: "Jesús citó este versículo como 'el primero y grande mandamiento' (Mateo 22:37)." },
  { q: "¿Quién fue comisionado como sucesor de Moisés al final del libro de Deuteronomio?", options: ["Josué", "Caleb", "Finees", "Eleazar"], correct: 0, ref: "Deuteronomio 31", detail: "Moisés le dijo: 'Esfuérzate y sé valiente', frase que Dios repitió directamente a Josué después." },
  { q: "¿Cuál de los cinco libros de la Torá contiene principalmente las leyes sacerdotales, los sacrificios y las normas de pureza ritual?", options: ["Levítico", "Génesis", "Números", "Deuteronomio"], correct: 0, ref: "Levítico", detail: "Su nombre viene de 'Leví', la tribu sacerdotal encargada de estas leyes." },
];

const TALMUD_LEGENDS_ES = [
  {
    title: "Abraham y los ídolos de su padre",
    legend: "Según el Midrash, el padre de Abraham, Téraj, vendía ídolos. Un día, el joven Abraham rompió todos los ídolos de la tienda excepto el más grande, y le puso el mazo en la mano. Cuando Téraj le reclamó, Abraham respondió que los ídolos habían peleado entre sí y el más grande los había destruido. Ante la protesta de su padre —'¡los ídolos no pueden moverse ni pelear!'—, Abraham replicó: '¿Y entonces por qué les rindes culto?'",
    source: "Génesis Rabá 38 (Midrash)",
    q: "Según esta leyenda del Midrash, ¿cómo demostró el joven Abraham que los ídolos de su padre no tenían poder?",
    options: ["Rompiéndolos todos menos el más grande y culpándolo a él", "Quemándolos en un altar", "Vendiéndolos a otro pueblo", "Pidiéndole a Dios que los destruyera"],
    correct: 0,
  },
  {
    title: "Abraham en el horno de fuego",
    legend: "Una leyenda judía cuenta que el rey Nimrod arrojó a Abraham a un horno ardiente por negarse a adorar ídolos, y que Dios lo protegió, saliendo ileso. Algunos rabinos vincularon esta historia con la expresión 'Ur de los caldeos' de Génesis 11:31, relacionando 'Ur' con la palabra hebrea para 'fuego'.",
    source: "Talmud, Pesajim 118a; Génesis Rabá 38",
    q: "Según esta leyenda, ¿qué rey habría arrojado a Abraham a un horno de fuego por negarse a adorar ídolos?",
    options: ["Nimrod", "Nabucodonosor", "El Faraón de Egipto", "Baladán"],
    correct: 0,
  },
  {
    title: "El niño Moisés y la prueba de las brasas",
    legend: "Cuenta una leyenda que, siendo niño en la corte egipcia, Moisés tomó la corona del Faraón y jugó con ella. Alarmados, los sabios de la corte propusieron una prueba: pusieron ante él oro y una brasa ardiente; si elegía el oro, sería una amenaza al trono. Un ángel guio su mano hacia la brasa, y Moisés se quemó al llevársela a la boca, lo que —según la leyenda— explicaría por qué después se describió a sí mismo como 'tardo en el habla' (Éxodo 4:10).",
    source: "Éxodo Rabá 1:26",
    q: "Según esta leyenda del Midrash, ¿qué le habría pasado a Moisés de niño para explicar su dificultad de habla mencionada en Éxodo 4?",
    options: ["Se quemó la boca con una brasa en una prueba de la corte", "Un león lo asustó de pequeño", "Tragó agua del Nilo accidentalmente", "Un sacerdote egipcio lo maldijo"],
    correct: 0,
  },
  {
    title: "Og, el rey gigante que sobrevivió al diluvio",
    legend: "El Talmud describe a Og, rey de Basán, como un gigante de una generación anterior. Según la leyenda, Og sobrevivió al diluvio de Noé sujetándose a un costado del arca. Siglos más tarde, ya como rey, fue derrotado en batalla por Moisés y el pueblo de Israel.",
    source: "Talmud, Zevajim 113b (comentando Números 21)",
    q: "Según la leyenda talmúdica, ¿cómo habría sobrevivido el gigante Og al diluvio de Noé?",
    options: ["Sujetándose al costado del arca", "Nadando durante los 40 días de lluvia", "Escondiéndose en la cima de una montaña", "Construyendo su propia balsa"],
    correct: 0,
  },
  {
    title: "Honi, el que dibujó el círculo",
    legend: "El Talmud narra que, en un año de sequía severa, el sabio Honi trazó un círculo en el suelo, se paró dentro y declaró que no saldría hasta que Dios enviara lluvia. Llovió. En otra historia famosa sobre él, Honi se quedó dormido bajo un árbol durante 70 años; al despertar, nadie lo reconocía, y a él le costó ser creído por los demás.",
    source: "Talmud, Taanit 23a",
    q: "Según el Talmud, ¿qué hizo el sabio Honi para pedir lluvia en un año de sequía?",
    options: ["Trazó un círculo en el suelo y se negó a salir hasta que lloviera", "Ayunó durante 40 días seguidos", "Subió a un monte a orar toda la noche", "Ofreció un sacrificio especial en el Templo"],
    correct: 0,
  },
  {
    title: "El pastor que llegó a ser el sabio Rabí Akiva",
    legend: "Según la tradición rabínica, Akiva era un pastor analfabeto de 40 años. Un día observó cómo una gota de agua, cayendo constantemente sobre una piedra, había logrado horadarla. Razonó que si el agua —algo blando— podía perforar la piedra —algo duro—, entonces la Torá también podía penetrar un corazón dispuesto a aprender. Comenzó a estudiar desde cero y llegó a ser uno de los más grandes sabios de la historia judía.",
    source: "Avot de Rabí Natán, capítulo 6",
    q: "Según la leyenda, ¿qué observó el pastor Akiva que lo inspiró a comenzar a estudiar Torá a los 40 años?",
    options: ["Una gota de agua que había horadado una piedra", "Una estrella fugaz en el desierto", "Un árbol seco que floreció de repente", "Un rollo antiguo enterrado en la arena"],
    correct: 0,
  },
  {
    title: "El anillo del rey Salomón",
    legend: "Una leyenda judía cuenta que Salomón poseía un anillo grabado con el Nombre de Dios, que le daba autoridad sobre los espíritus, y que estos habrían colaborado en la construcción del Templo. En otra historia relacionada, el espíritu Asmodeo (Ashmedai) engañó a Salomón, le quitó el anillo y ocupó su trono por un tiempo, hasta que el rey logró recuperar su lugar.",
    source: "Talmud, Guitín 68a-68b",
    q: "Según esta leyenda, ¿qué espíritu llegó a ocupar el trono de Salomón después de quitarle su anillo?",
    options: ["Asmodeo (Ashmedai)", "Lucifer", "Beelzebú", "Samael"],
    correct: 0,
  },
  {
    title: "El horno de Ajnai: 'la Torá no está en los cielos'",
    legend: "En un célebre debate legal del Talmud, el rabino Eliezer defendía su postura apelando a señales milagrosas, hasta que una voz celestial confirmó que él tenía razón. Aun así, el rabino Josué respondió citando Deuteronomio: 'la Torá no está en los cielos', argumentando que, una vez entregada, la interpretación de la Ley corresponde a los sabios humanos. Según la leyenda, Dios mismo sonrió al oír esto y dijo: 'Mis hijos me han vencido'.",
    source: "Talmud, Bavá Metzía 59b",
    q: "En esta historia talmúdica, ¿qué argumentó el rabino Josué frente a una voz celestial que respaldaba a su oponente?",
    options: ["Que 'la Torá no está en los cielos' y su interpretación corresponde a los sabios", "Que la voz celestial debía repetirse tres veces para ser válida", "Que solo el sumo sacerdote podía interpretar la Ley", "Que el debate debía posponerse hasta el Templo"],
    correct: 0,
  },
  {
    title: "Adán, formado del polvo de toda la tierra",
    legend: "Según una enseñanza talmúdica, Dios reunió el polvo para formar a Adán de las cuatro esquinas del mundo entero, para que ninguna nación pudiera alegar que la humanidad se originó solo en su territorio y considerarse, por eso, superior a las demás.",
    source: "Talmud, Sanhedrín 38a",
    q: "Según esta enseñanza talmúdica, ¿de dónde se recogió el polvo con el que se formó a Adán?",
    options: ["De las cuatro esquinas de toda la tierra", "Solo del interior del Jardín del Edén", "De la cima del monte Sinaí", "De la orilla del río Éufrates"],
    correct: 0,
  },
  {
    title: "El banquete del Leviatán y el Behemot",
    legend: "El Talmud describe a dos criaturas colosales creadas por Dios en el principio: el Leviatán, del mar, y el Behemot, de la tierra. Según la leyenda, en el mundo venidero Dios preparará con ellos un gran banquete para los justos.",
    source: "Talmud, Bavá Batrá 74b-75a",
    q: "Según la leyenda talmúdica, ¿qué se hará con las criaturas Leviatán y Behemot en el mundo venidero?",
    options: ["Se preparará con ellos un banquete para los justos", "Se les liberará para gobernar el mar y la tierra", "Se convertirán en guardianes eternos del paraíso", "Pelearán entre sí para siempre"],
    correct: 0,
  },
  {
    title: "Moisés observa el futuro: la clase de Rabí Akiva",
    legend: "El Talmud narra que, mientras Moisés recibía la Torá en el Sinaí, Dios le permitió ver el futuro y observar al rabino Akiva enseñando generaciones después. Moisés, sin poder seguir una enseñanza tan avanzada, se sintió angustiado, hasta que oyó a un discípulo preguntar el origen de una ley y a Akiva responder: 'Es una ley dada a Moisés en el Sinaí'. Solo entonces Moisés se tranquilizó.",
    source: "Talmud, Menajot 29b",
    q: "En esta leyenda, ¿qué tranquilizó finalmente a Moisés al ver una clase futura del rabino Akiva que no lograba entender?",
    options: ["Oír a Akiva decir que esa ley venía 'de Moisés en el Sinaí'", "Ver que Akiva era descendiente suyo", "Reconocer el idioma que usaban en la clase", "Ver que enseñaban en el mismo monte Sinaí"],
    correct: 0,
  },
];

const TORAH_QUESTIONS_EN = [
  { q: "What is the most solemn day of the Jewish calendar called, dedicated to atoning for the sins of the whole people?", options: ["Yom Kippur (Day of Atonement)", "Rosh Hashanah", "Purim", "Hanukkah"], correct: 0, ref: "Leviticus 16", detail: "It was the only day of the year the high priest entered the Most Holy Place of the tabernacle." },
  { q: "How often was the Year of Jubilee supposed to be celebrated according to Leviticus?", options: ["Every 7 years", "Every 50 years", "Every 12 years", "Every 100 years"], correct: 1, ref: "Leviticus 25", detail: "In the Jubilee, slaves were freed and land returned to its original owners." },
  { q: "What trait did land mammals need to be considered 'clean' and fit to eat according to Leviticus 11?", options: ["A split hoof and chewing the cud", "Being herbivores", "Living in herds", "Having horns"], correct: 0, ref: "Leviticus 11", detail: "That's why the pig was considered unclean: it has a split hoof but doesn't chew the cud." },
  { q: "Which commandment from Leviticus 19 did Jesus quote as the second greatest of all?", options: ["Love your neighbor as yourself", "You shall not steal", "Keep the Sabbath", "Honor your parents"], correct: 0, ref: "Leviticus 19:18", detail: "Jesus paired it with loving God as the summary of 'all the Law and the Prophets' (Matthew 22)." },
  { q: "What phrase sums up the central call to holiness in the book of Leviticus?", options: ["'Be holy, because I, the Lord your God, am holy'", "'Seek first the kingdom of God'", "'The righteous will live by faith'", "'There is no other name under heaven'"], correct: 0, ref: "Leviticus 19:2", detail: "This phrase is repeated several times in Leviticus as the foundation of the whole 'holiness code'." },
  { q: "What were the Israelites forbidden to eat along with meat, because it represented the animal's life?", options: ["Blood", "Fat only", "Bones", "The liver"], correct: 0, ref: "Leviticus 17", detail: "The text explains that 'the life of the flesh is in the blood'." },
  { q: "How many main annual feasts does the religious calendar of Leviticus 23 establish?", options: ["Seven", "Three", "Twelve", "Five"], correct: 0, ref: "Leviticus 23", detail: "They include Passover, Unleavened Bread, Firstfruits, Weeks, Trumpets, Atonement, and Tabernacles." },
  { q: "How many Israelite men fit for war did the first census in the book of Numbers count?", options: ["Just over 603,000", "About 12,000", "Nearly 1 million", "About 70,000"], correct: 0, ref: "Numbers 1", detail: "The census was taken by tribe, one year after leaving Egypt." },
  { q: "Which object of Aaron's blossomed and produced almonds as a sign that God had chosen him as priest?", options: ["His staff", "His robe", "His belt", "His cup"], correct: 0, ref: "Numbers 17", detail: "Twelve staffs were placed, one per tribe, and only Aaron's sprouted overnight." },
  { q: "What did Moses do to heal the Israelites bitten by venomous snakes in the desert?", options: ["He raised a bronze snake on a pole", "He offered a lamb sacrifice", "He covered them with manna", "He took them up Mount Sinai"], correct: 0, ref: "Numbers 21", detail: "Whoever looked at the bronze snake was healed; centuries later Jesus compared this to his own crucifixion (John 3:14)." },
  { q: "Which group of five sisters requested and received the right to inherit land because they had no brothers?", options: ["The daughters of Zelophehad", "The daughters of Laban", "The daughters of Jethro", "The daughters of Korah"], correct: 0, ref: "Numbers 27", detail: "Their case established a new inheritance law for all of Israel when a family had no sons." },
  { q: "Of the whole adult generation that left Egypt, who were the only ones who actually entered the Promised Land?", options: ["Joshua and Caleb", "Moses and Aaron", "Phinehas and Eleazar", "Korah and Dathan"], correct: 0, ref: "Numbers 14 and 26", detail: "The rest of that generation died during the 40 years in the desert, for not trusting God's promise." },
  { q: "How many spies in total were sent to explore the land of Canaan?", options: ["Twelve, one per tribe", "Two", "Seventy", "Forty"], correct: 0, ref: "Numbers 13", detail: "Only two of the twelve, Joshua and Caleb, gave a report of confidence that God would give them the land." },
  { q: "What is the central declaration of Israel's faith called, beginning 'Hear, O Israel: the Lord our God, the Lord is one'?", options: ["The Shema", "The Kaddish", "The Song of Moses", "The Blessing of Aaron"], correct: 0, ref: "Deuteronomy 6:4", detail: "To this day, this prayer is recited daily in Jewish tradition, morning and evening." },
  { q: "On which two mountains were the covenant's blessings and curses pronounced upon entering Canaan?", options: ["Gerizim (blessings) and Ebal (curses)", "Sinai and Horeb", "Carmel and Tabor", "Zion and Moriah"], correct: 0, ref: "Deuteronomy 27-28", detail: "Six tribes stood on each mountain, with the valley of Shechem between them." },
  { q: "From which mountain did Moses see the Promised Land without being able to enter it?", options: ["Mount Nebo", "Mount Sinai", "Mount Carmel", "The Mount of Olives"], correct: 0, ref: "Deuteronomy 34", detail: "God showed him the whole land 'from Gilead to Dan', but Moses died right there, in Moab." },
  { q: "How old was Moses when he died, according to Deuteronomy 34?", options: ["120 years", "80 years", "100 years", "150 years"], correct: 0, ref: "Deuteronomy 34:7", detail: "The text adds that 'his eyes were not weak, nor his vigor abated'." },
  { q: "Which commandment does Deuteronomy 6:5 sum up as the essence of the whole Law?", options: ["Love the Lord with all your heart, soul, and strength", "Keep the Sabbath without exception", "Offer sacrifices every morning", "Do not eat pork"], correct: 0, ref: "Deuteronomy 6:5", detail: "Jesus quoted this verse as 'the first and greatest commandment' (Matthew 22:37)." },
  { q: "Who was commissioned as Moses' successor at the end of the book of Deuteronomy?", options: ["Joshua", "Caleb", "Phinehas", "Eleazar"], correct: 0, ref: "Deuteronomy 31", detail: "Moses told him: 'Be strong and courageous,' a phrase God repeated directly to Joshua afterward." },
  { q: "Which of the five books of the Torah mainly contains priestly laws, sacrifices, and rules of ritual purity?", options: ["Leviticus", "Genesis", "Numbers", "Deuteronomy"], correct: 0, ref: "Leviticus", detail: "Its name comes from 'Levi', the priestly tribe in charge of these laws." },
];

const TALMUD_LEGENDS_EN = [
  {
    title: "Abraham and his father's idols",
    legend: "According to the Midrash, Abraham's father, Terah, sold idols. One day, young Abraham smashed all the idols in the shop except the largest one, and put the hammer in its hand. When Terah confronted him, Abraham said the idols had fought among themselves and the largest one had destroyed the rest. When his father protested — 'idols can't move or fight!' — Abraham replied, 'Then why do you worship them?'",
    source: "Genesis Rabbah 38 (Midrash)",
    q: "According to this Midrash legend, how did young Abraham show that his father's idols had no power?",
    options: ["By smashing all of them but the largest, and blaming that one", "By burning them on an altar", "By selling them to another people", "By asking God to destroy them"],
    correct: 0,
  },
  {
    title: "Abraham in the fiery furnace",
    legend: "A Jewish legend tells that King Nimrod threw Abraham into a blazing furnace for refusing to worship idols, and that God protected him, so he came out unharmed. Some rabbis linked this story to the phrase 'Ur of the Chaldeans' in Genesis 11:31, connecting 'Ur' with the Hebrew word for 'fire'.",
    source: "Talmud, Pesachim 118a; Genesis Rabbah 38",
    q: "According to this legend, which king is said to have thrown Abraham into a fiery furnace for refusing to worship idols?",
    options: ["Nimrod", "Nebuchadnezzar", "The Pharaoh of Egypt", "Baladan"],
    correct: 0,
  },
  {
    title: "Young Moses and the test of the coals",
    legend: "A legend tells that, as a child at the Egyptian court, Moses took Pharaoh's crown and played with it. Alarmed, the court's wise men proposed a test: they set before him gold and a burning coal; if he chose the gold, he'd be a threat to the throne. An angel guided his hand toward the coal, and Moses burned himself putting it to his mouth — which, according to the legend, would explain why he later described himself as 'slow of speech' (Exodus 4:10).",
    source: "Exodus Rabbah 1:26",
    q: "According to this Midrash legend, what happened to young Moses that explains his difficulty speaking, mentioned in Exodus 4?",
    options: ["He burned his mouth with a coal during a test at court", "A lion frightened him as a child", "He accidentally swallowed water from the Nile", "An Egyptian priest cursed him"],
    correct: 0,
  },
  {
    title: "Og, the giant king who survived the flood",
    legend: "The Talmud describes Og, king of Bashan, as a giant from an earlier generation. According to the legend, Og survived Noah's flood by holding on to the side of the ark. Centuries later, as king, he was defeated in battle by Moses and the people of Israel.",
    source: "Talmud, Zevachim 113b (commenting on Numbers 21)",
    q: "According to the Talmudic legend, how did the giant Og supposedly survive Noah's flood?",
    options: ["By holding on to the side of the ark", "By swimming for the 40 days of rain", "By hiding on top of a mountain", "By building his own raft"],
    correct: 0,
  },
  {
    title: "Honi, the circle-drawer",
    legend: "The Talmud tells that, in a year of severe drought, the sage Honi drew a circle on the ground, stood inside it, and declared he would not leave until God sent rain. It rained. In another famous story about him, Honi fell asleep under a tree for 70 years; when he woke up, no one recognized him, and he himself had trouble being believed.",
    source: "Talmud, Taanit 23a",
    q: "According to the Talmud, what did the sage Honi do to ask for rain in a year of drought?",
    options: ["He drew a circle on the ground and refused to leave until it rained", "He fasted for 40 days straight", "He climbed a mountain to pray all night", "He offered a special sacrifice at the Temple"],
    correct: 0,
  },
  {
    title: "The shepherd who became the sage Rabbi Akiva",
    legend: "According to rabbinic tradition, Akiva was an illiterate 40-year-old shepherd. One day he noticed how a drop of water, falling constantly on a stone, had managed to wear a hole through it. He reasoned that if water — something soft — could pierce stone — something hard — then the Torah could also penetrate a heart willing to learn. He began studying from scratch and became one of the greatest sages in Jewish history.",
    source: "Avot de-Rabbi Natan, chapter 6",
    q: "According to the legend, what did the shepherd Akiva observe that inspired him to start studying Torah at age 40?",
    options: ["A drop of water that had worn a hole through a stone", "A shooting star in the desert", "A dry tree that suddenly bloomed", "An ancient scroll buried in the sand"],
    correct: 0,
  },
  {
    title: "King Solomon's ring",
    legend: "A Jewish legend tells that Solomon owned a ring engraved with the Name of God, which gave him authority over spirits, and that they supposedly helped build the Temple. In another related story, the spirit Asmodeus (Ashmedai) tricked Solomon, took his ring, and occupied his throne for a time, until the king managed to reclaim his place.",
    source: "Talmud, Gittin 68a-68b",
    q: "According to this legend, which spirit came to occupy Solomon's throne after taking his ring?",
    options: ["Asmodeus (Ashmedai)", "Lucifer", "Beelzebub", "Samael"],
    correct: 0,
  },
  {
    title: "The Oven of Akhnai: 'the Torah is not in heaven'",
    legend: "In a famous legal debate in the Talmud, Rabbi Eliezer defended his position by appealing to miraculous signs, until a heavenly voice confirmed he was right. Even so, Rabbi Joshua responded by quoting Deuteronomy: 'the Torah is not in heaven', arguing that once given, interpreting the Law was up to human sages. According to the legend, God himself smiled on hearing this and said, 'My children have defeated me.'",
    source: "Talmud, Bava Metzia 59b",
    q: "In this Talmudic story, what did Rabbi Joshua argue against a heavenly voice that backed his opponent?",
    options: ["That 'the Torah is not in heaven' and its interpretation belongs to the sages", "That the heavenly voice had to repeat itself three times to count", "That only the high priest could interpret the Law", "That the debate had to be postponed until the Temple was rebuilt"],
    correct: 0,
  },
  {
    title: "Adam, formed from dust from the whole earth",
    legend: "According to a Talmudic teaching, God gathered dust from the four corners of the whole earth to form Adam, so that no nation could claim humanity originated only in its territory and consider itself, for that reason, superior to the rest.",
    source: "Talmud, Sanhedrin 38a",
    q: "According to this Talmudic teaching, where was the dust gathered from that formed Adam?",
    options: ["From the four corners of the whole earth", "Only from inside the Garden of Eden", "From the top of Mount Sinai", "From the bank of the Euphrates river"],
    correct: 0,
  },
  {
    title: "The banquet of the Leviathan and the Behemoth",
    legend: "The Talmud describes two colossal creatures created by God at the beginning: the Leviathan, of the sea, and the Behemoth, of the land. According to the legend, in the world to come God will prepare a great banquet with them for the righteous.",
    source: "Talmud, Bava Batra 74b-75a",
    q: "According to the Talmudic legend, what will be done with the creatures Leviathan and Behemoth in the world to come?",
    options: ["A banquet will be prepared with them for the righteous", "They will be released to rule the sea and the land", "They will become eternal guardians of paradise", "They will fight each other forever"],
    correct: 0,
  },
  {
    title: "Moses glimpses the future: Rabbi Akiva's classroom",
    legend: "The Talmud tells that, while Moses was receiving the Torah at Sinai, God let him see the future and watch Rabbi Akiva teaching generations later. Moses, unable to follow such an advanced teaching, grew distressed — until he heard a student ask the source of a law and Akiva answer, 'It is a law given to Moses at Sinai.' Only then was Moses comforted.",
    source: "Talmud, Menachot 29b",
    q: "In this legend, what finally comforted Moses as he watched a future class by Rabbi Akiva that he couldn't understand?",
    options: ["Hearing Akiva say that law came 'from Moses at Sinai'", "Seeing that Akiva was his descendant", "Recognizing the language used in the class", "Seeing that they taught on the same Mount Sinai"],
    correct: 0,
  },
];
