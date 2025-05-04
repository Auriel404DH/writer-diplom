import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Начинаем заполнение базы данных тестовыми данными...");

    // Check if we have users
    const existingUsers = await db.query.users.findMany({
      limit: 1,
    });

    if (existingUsers.length === 0) {
      console.log("Создание пользователей...");
      
      // Create demo users
      const users = await Promise.all([
        db.insert(schema.users).values({
          username: "annapetrov",
          password: await hashPassword("password123"),
        }).returning(),
        db.insert(schema.users).values({
          username: "ivansokolov",
          password: await hashPassword("password123"),
        }).returning(),
        db.insert(schema.users).values({
          username: "mariaivanova",
          password: await hashPassword("password123"),
        }).returning(),
      ]);

      console.log(`Создано ${users.length} пользователей`);
      
      // Create books for the first user
      const annaId = users[0][0].id;
      
      console.log("Создание книг...");
      
      const book1 = await db.insert(schema.books).values({
        authorId: annaId,
        title: "Путь к звёздам",
        description: "Научно-фантастический роман о путешествии к далеким звездам и встрече с внеземными цивилизациями.",
        published: true,
        genres: ["фантастика", "космос", "приключения"],
        wordCount: 2500,
        chapterCount: 4,
        viewCount: 125,
        reviewCount: 0,
        rating: 0,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(),
        publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      }).returning();
      
      const book2 = await db.insert(schema.books).values({
        authorId: annaId,
        title: "Тайны старого города",
        description: "Детективная история о загадочных происшествиях в старинном городе.",
        published: false,
        genres: ["детектив", "мистика"],
        wordCount: 1200,
        chapterCount: 3,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(),
      }).returning();
      
      console.log(`Создано ${book1.length + book2.length} книг`);
      
      // Create chapters
      console.log("Создание глав...");
      
      const chapters = await Promise.all([
        // Chapters for book 1
        db.insert(schema.chapters).values({
          bookId: book1[0].id,
          title: "Глава 1: Начало",
          content: `<p>Алексей смотрел на звёздное небо из окна своего маленького домика на окраине города. Звёзды казались такими близкими, что, протяни руку, и коснёшься их холодного сияния.</p>
<p>«Где-то там, — думал он, — есть жизнь. Должна быть.» Эта мысль не давала ему покоя уже много лет, с тех самых пор, как в детстве отец подарил ему первый телескоп.</p>
<p>Сегодня был особенный день. Ровно десять лет назад он отправил своё первое сообщение в космос. И сегодня он получил ответ.</p>
<p>Сообщение пришло не так, как он ожидал. Не радиосигналом и не через официальные каналы связи с космическими станциями. Оно пришло во сне.</p>
<p>«Мы ждали тебя. Мы знаем, кто ты. Путь к звёздам открыт.»</p>
<p>Именно эти слова разбудили его посреди ночи в холодном поту. Сначала он списал это на разыгравшееся воображение, но потом заметил странное свечение за окном...</p>`,
          published: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        }).returning(),
        db.insert(schema.chapters).values({
          bookId: book1[0].id,
          title: "Глава 2: Встреча",
          content: `<p>Свечение усиливалось. Алексей протер глаза, думая, что это просто остаточное явление сна, но нет — за окном действительно что-то светилось.</p>
<p>Он осторожно подошел к окну и отодвинул занавеску. В саду, прямо посреди его небольшой лужайки, парил светящийся шар размером с футбольный мяч.</p>
<p>«Это какая-то шутка? Может быть, соседские дети?» — подумал Алексей, но в глубине души уже понимал, что происходит нечто необъяснимое.</p>
<p>Он накинул куртку и вышел во двор. Шар мягко пульсировал голубоватым светом. Когда Алексей приблизился, шар начал медленно двигаться в сторону леса.</p>
<p>«Он хочет, чтобы я следовал за ним», — понял Алексей.</p>`,
          published: true,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        }).returning(),
        db.insert(schema.chapters).values({
          bookId: book1[0].id,
          title: "Глава 3: Путешествие",
          content: `<p>Лес казался живым существом, дышащим и наблюдающим. Алексей следовал за парящим шаром, который освещал его путь мягким голубым светом.</p>
<p>Ветви деревьев расступались, словно сами желали пропустить его дальше. Где-то вдалеке ухали совы, но в остальном лес был неестественно тих.</p>
<p>«Куда ты ведешь меня?» — прошептал Алексей, не ожидая ответа.</p>
<p>Но к его удивлению, в голове зазвучал голос — не мужской и не женский, просто... голос.</p>
<p>«К тем, кто ждал тебя. К тем, кто верит в тебя».</p>`,
          published: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
          publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        }).returning(),
        db.insert(schema.chapters).values({
          bookId: book1[0].id,
          title: "Глава 4: Конфликт",
          content: `<p>Поляна открылась внезапно. Алексей застыл на месте, не веря своим глазам. Посреди поляны стоял объект, который можно было описать только как космический корабль.</p>
<p>Он был не таким, как изображают в фильмах — никаких летающих тарелок или цилиндров. Это была геометрическая фигура, которая, казалось, существовала одновременно в нескольких измерениях.</p>
<p>Светящийся шар, сопровождавший Алексея, медленно поплыл к кораблю и растворился в его поверхности.</p>
<p>Почти сразу же перед Алексеем появилась фигура. Существо было гуманоидным, но определенно не человеком — высокое, с серебристой кожей и глазами, в которых отражались звезды.</p>
<p>«Мы долго ждали», — прозвучало в голове Алексея.</p>`,
          published: true,
          createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
          publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        }).returning(),
        
        // Chapters for book 2
        db.insert(schema.chapters).values({
          bookId: book2[0].id,
          title: "Глава 1: Прибытие",
          content: `<p>Туман окутывал улицы Старгорода, когда такси остановилось у старинного отеля «Империал». Елена вышла из машины и посмотрела на величественное здание викторианской эпохи.</p>
<p>«Добро пожаловать в Старгород, мисс Волкова», — сказал таксист с легким местным акцентом. «Будьте осторожны. Ночи здесь... особенные».</p>
<p>Елена улыбнулась. Как журналист, специализирующийся на паранормальных явлениях, она приехала именно за этими «особенными» ночами.</p>
<p>Серия необъяснимых исчезновений привела ее в этот туманный городок. И она была полна решимости раскрыть тайну.</p>`,
          published: false,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        }).returning(),
        db.insert(schema.chapters).values({
          bookId: book2[0].id,
          title: "Глава 2: Старые легенды",
          content: `<p>Библиотека Старгорода была настоящим храмом знаний — высокие потолки, деревянные стеллажи до самого верха, запах старых книг.</p>
<p>«Вы ищете что-то конкретное?» — спросила пожилая библиотекарь, когда заметила, что Елена изучает раздел местной истории.</p>
<p>«Я хотела бы узнать больше о легендах Старгорода», — ответила Елена. «Особенно о тех, что связаны с исчезновениями людей».</p>
<p>Лицо библиотекаря изменилось. «Ох, милая, зачем вам это? Некоторые истории лучше оставить в прошлом».</p>
<p>Но Елена была настойчива, и в конце концов библиотекарь указала на древнюю книгу в кожаном переплете. «Хроники Старгорода, 1887 год. Но я вас предупредила».</p>`,
          published: false,
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        }).returning(),
        db.insert(schema.chapters).values({
          bookId: book2[0].id,
          title: "Глава 3: Первая встреча",
          content: `<p>Елена проснулась от странного звука. Часы показывали 3:33 утра — «час ведьм», как его называли в средневековье.</p>
<p>Звук повторился — тихий стук, будто кто-то осторожно постукивал по стеклу ее окна. Но ее номер был на третьем этаже.</p>
<p>Она медленно подошла к окну и отодвинула штору. Туман за окном был таким плотным, что казался живым существом. И на мгновение Елене показалось, что она видит в нем лицо.</p>
<p>Телефон зазвонил так внезапно, что она вздрогнула. Номер был неизвестен.</p>
<p>«Не смотрите в туман», — прошептал голос, когда она ответила. «Они увидят вас».</p>`,
          published: false,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        }).returning(),
      ]);
      
      console.log(`Создано ${chapters.length} глав`);
      
      // Create cards
      console.log("Создание карточек объектов...");
      
      const cardData = [
        {
          userId: annaId,
          type: "character",
          title: "Алексей Соколов",
          description: "Астроном-любитель, 34 года. Одинок, живет на окраине города. Мечтает найти внеземную жизнь.",
          tags: ["главный герой", "ученый"],
          chapterIds: [chapters[0][0].id, chapters[1][0].id, chapters[2][0].id, chapters[3][0].id],
        },
        {
          userId: annaId,
          type: "location",
          title: "Домик Алексея",
          description: "Небольшой одноэтажный дом на окраине города. Много астрономического оборудования. Уединенное место с хорошим видом на звездное небо.",
          tags: ["дом", "обсерватория"],
          chapterIds: [chapters[0][0].id, chapters[1][0].id],
        },
        {
          userId: annaId,
          type: "event",
          title: "Получение сообщения",
          description: "Алексей получает странное сообщение во сне, которое считает ответом на свой сигнал, отправленный в космос 10 лет назад.",
          tags: ["ключевое событие", "завязка"],
          chapterIds: [chapters[0][0].id],
        },
        {
          userId: annaId,
          type: "character",
          title: "Елена Волкова",
          description: "Журналист, специализирующийся на паранормальных явлениях. Умная, скептичная, но открытая к необычным вещам.",
          tags: ["главный герой", "журналист"],
          chapterIds: [chapters[4][0].id, chapters[5][0].id, chapters[6][0].id],
        },
        {
          userId: annaId,
          type: "location",
          title: "Старгород",
          description: "Старинный город с богатой историей, окутанный туманом и тайнами. Место, где происходят необъяснимые исчезновения.",
          tags: ["город", "мистика"],
          chapterIds: [chapters[4][0].id, chapters[5][0].id, chapters[6][0].id],
        },
      ];
      
      for (const card of cardData) {
        const { chapterIds, ...cardInfo } = card;
        
        // Create card
        const [newCard] = await db.insert(schema.cards).values({
          ...cardInfo,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();
        
        // Create card-chapter relations
        for (const chapterId of chapterIds) {
          await db.insert(schema.cardChapters).values({
            cardId: newCard.id,
            chapterId,
          });
        }
      }
      
      console.log(`Создано ${cardData.length} карточек объектов`);
      
      console.log("Заполнение базы данных завершено успешно!");
    } else {
      console.log("База данных уже содержит данные. Пропускаем заполнение.");
    }
  } catch (error) {
    console.error("Ошибка при заполнении базы данных:", error);
  }
}

seed();
