# Nimbus Keyboards

Демо-проект: лендинг вымышленной механической клавиатуры Vapor75 с интерактивными 3D-сценами. Это не коммерческий продукт, а портфолио-работа. Она показывает, как я работаю с WebGL, анимациями, производительностью и архитектурой фронтенда.

## Что показывает проект

- **3D в React.** Сцены на three.js и @react-three/fiber:
    - клавиатура, которая собирается в интро и «волной» поднимает клавиши при скролле;
    - галерея свитчей со звуком нажатия;
    - смена расцветки кейкапов в реальном времени.
- **Анимации.** GSAP и ScrollTrigger: интро, скролл-таймлайны, посимвольное появление заголовка (SplitText), вариативный шрифт, реагирующий на курсор. Всё учитывает `prefers-reduced-motion`.
- **Производительность WebGL.**
    - 80 свитчей рендерятся через `InstancedMesh` с общим буфером матриц.
    - Материалы создаются один раз, а анимации идут через refs, без ререндеров React.
    - Канвасы ниже первого экрана монтируются лениво и останавливают рендер вне вьюпорта.
    - После интро они по одному прогреваются в простое: шейдеры компилируются через `compileAsync`, текстуры загружаются на GPU заранее, поэтому секции появляются без подлагиваний.
    - План перехода на один общий канвас с drei `View` описан в [specs/shared-canvas-view.md](specs/shared-canvas-view.md).
    - Тени и `dpr` ограничены, Draco-декодер и HDR-окружения размещены в самом проекте.
- **Архитектура.**
    - Данные (раскладка клавиатуры, наборы кейкапов, свитчи, навигация) отделены от компонентов.
    - Общая логика вынесена в хуки, чистые функции — в `lib/` и покрыты тестами.
- **Качество кода.** Строгий TypeScript, ESLint, Prettier, юнит-тесты на Vitest и Testing Library.

## Стек

- [Next.js 15](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript
- [three.js](https://threejs.org), [@react-three/fiber](https://r3f.docs.pmnd.rs), [drei](https://drei.docs.pmnd.rs)
- [GSAP](https://gsap.com): ScrollTrigger, SplitText
- Tailwind CSS 4, [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css), Radix Dialog
- Вариативный шрифт Roboto Flex через `next/font`
- Vitest, Testing Library

## Запуск

Нужен Node.js 22 или новее.

```bash
npm ci
npm run dev
```

Сайт откроется на [http://localhost:3000](http://localhost:3000).

| Скрипт          | Назначение              |
| --------------- | ----------------------- |
| `npm run dev`   | Дев-сервер на Turbopack |
| `npm run build` | Продакшен-сборка        |
| `npm run start` | Запуск продакшен-сборки |
| `npm run lint`  | ESLint                  |
| `npm test`      | Юнит-тесты (Vitest)     |

Форматирование проверяется командой `npx prettier --check .`.

## Структура

```
src/
  app/                 layout, страница, глобальные стили
  sections/            секции лендинга (Hero, BentoBox, Switches, ColorChanger, Marquee, PurchaseButton)
  components/
    layout/            Navbar, Footer, Bounded
    three/             3D-модели (Keyboard, Keycap, Switch), раскладка клавиатуры, хелперы сцен
    ui/                FadeIn, Loader, логотипы
  data/                наборы кейкапов, свитчи, навигация
  hooks/               reduced motion, видимость канваса, пул звуков, checkout
  lib/                 настройка GSAP и чистые функции (тайминг волны, оси шрифта, звук)
public/
  *.gltf, *.bin        модели со сжатием Draco
  draco/               Draco-декодер (копия из three/examples/jsm/libs/draco/gltf)
  hdr/                 карты окружения (potsdamer_platz_1k.hdr — пресет `city` из drei)
  sounds/              звуки нажатия свитчей
```

## Ограничения демо

- Магазина нет: кнопки «Buy» запускают заглушку оформления заказа (`src/hooks/useCheckout.ts`).
- Бренд Nimbus и клавиатура Vapor75 вымышлены.
