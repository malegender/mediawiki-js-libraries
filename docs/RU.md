## Описание

Расширение создано для использования [npm](https://www.npmjs.com/) пакетов на платформе [mediawiki](https://www.mediawiki.org/wiki/MediaWiki).  
При сброке модулей используется [webpack 5](https://webpack.js.org/) с поддержкой ECMAScript 6.  
В качестве препроцессора стилей используется [less](https://lesscss.org/).

### Использование Vue

#### Проблемы
Mediawiki использует Vue, который подключается как модуль `vue`. Этот модуль нельзя переопределить корректным способом.
При сборке vue компонентов в JSLibraries, требуется библиотека Vue, которая попадает в сборку. 
Таким образом, на странице будет одновременно два инстанса объекта Vue. В модулях [Mediawiki](https://www.mediawiki.org/wiki/ResourceLoader) и в модулях [Webpack](https://webpack.js.org/).
При создании js приложения с помощью модуля `vue` и последующим использованием компонентов из JSLibraries возникают проблемы (например, не работают слоты).

#### Решения
1. Использовать только Vue из Mediawiki. Включено по умолчанию. Изменить можно в [настройках](#settings).
**Важно!** Требуется обязательное подключение модуля `vue` в зависимостях модуля в Mediawiki, где будут использоваться компоненты из JSLibraries.
2. Использовать Vue из JSLibraries отдельно от Vue из Mediawiki.
Это может потребоваться, когда нужно использовать версию Vue отличную от версии в Mediawiki.
В [настройках](#settings) нужно изменить параметр `useMediawikiVue` на `false`.

### Структура каталогов
```bash
├── modules
└── resources
    ├── exposes
    │   └── example
    │       ├── example.css
    │       ├── example.js
    │       └── example.style.css
    └── src
        └── example
            └── for-example.js
```

* `/modules` - каталог, где генерируются файлы модулей. __Важно!__ _При компиляции данная папка очищается_.
* `/resources/exposes` - каталог иходных файлов, которые будут скомпилированны в файлы модулей.
Обычно это файлы реэкспорта библиотек. __Важно!__ _Файлы стилей с суфиксом `.style` не будут импортироваться в `js` файлы.
Они будут скомпилированны отдельно._ 
* `/resources/src` - каталог для произвольных файлов, которые можно подключать в файлах каталога `resources/exposes`.

### Структура файлов модулей

```bash
├── modules
    ├── runtime.js
    ├── vendors.js
    └── example
        ├── example.css
        ├── example.js
        └── example.style.css
```

* `/modules/runtime.js` - [runtimeChunk](https://webpack.js.org/configuration/optimization/#optimizationruntimechunk).
Необходим для сборки модулей webpack.
При генерции [extension.json](https://www.mediawiki.org/wiki/Manual:Extension.json/Schema) подключается через модуль `ext.JSLibraries.runtime`.
__Важно!__ _Необходимо подключать к каждому модулю в зависимостях_.
* `/modules/vendors.js` - [при компиляции](https://webpack.js.org/configuration/optimization/#optimizationsplitchunks), содержимое библиотек из `node_modules` попадает в этот файл.
* `/modules/example` - файлы модуля.

### Структура ResourceModules в extension.json

```json
{
  "ResourceModules": {
    "ext.JSLibraries.runtime": {
      "packageFiles": [
        "runtime.js"
      ]
    },
    "ext.JSLibraries.vendors": {
      "packageFiles": [
        "vendors.js"
      ]
    },
    "ext.JSLibraries.example.example": {
      "packageFiles": [
        "example/example.js"
      ],
      "dependencies": [
        "ext.JSLibraries.runtime"
      ],
      "styles": [
        "example/example.css",
        "example/example.style.css"
      ]
    }
  }
}
```
### <a id="settings">Настройки</a>

Изменить настройки сборки можно в файле `jsl.config.js`

* `useMediawikiVue` - использовать Vue из Mediawiki. По умолчанию - `true`.

### Использование

* Установите [npm](https://www.npmjs.com/)  
* Установите пакеты `npm install`
* Установите необходимую библиотеку `npm i --save package-name`
* В каталоге `/resources/exposes` разместите файлы реэкспорта npm пакета или файлы собственных библиотек.
Файлы могут быть js или css. __Важно!__ _Файлы стилей с суфиксом `.style` не будут импортироваться в `js` файлы.
Они будут скомпилированны отдельно._
* Собрать и зарегистрировать модули `npm run affix`
* Модули можно использовать в любом месте платформы `mediawiki`.

### Ограничения

* Каталог `/modules` очищается при компиляции.
* Файлы стилей с суфиксом `.style` не импортируются в `js` файлы.
* Модуль `ext.JSLibraries.runtime` должен подклчаться ко всем экспортируемым модулям.
* Модуль `ext.JSLibraries.vendors` должен подключаться на всех страницах.
* ResourceModules в [extension.json](https://www.mediawiki.org/wiki/Manual:Extension.json/Schema) полностью обновляется при генерации.
Остаются только модули из каталога `/modules`. В самих модулях ResourceModules, обновляются только свойства `packageFiles` и `scripts`.
Другие [атрибуты](https://www.mediawiki.org/wiki/Manual:Extension.json/Schema)  можно добавлять (например `messages`).
* При подулючение модулей, необходимо проверять, что возвращает require при подулючении модуля.  
Пример экспорта в `/resources/exposes/example/example.js`: `export default () => console.log('Hello World!');`.
В файле подключения модуля следует импортировать так: `const sayHello = require('ext.JSLibraries.say-hello').default`

### Рабочие сценарии

`npm run affix` - очищает `/modules`, собирает файлы из `/resources/exposes` в `/modules`, генерирует `/extension.json`.  
`npm run build` - очищает `/modules`, собирает файлы из `/resources/exposes` в `/modules`.  
`npm run clean` - очищает `/modules`.  
`npm run extension` - генерирует `/extension.json`.

### Заметки

Все библиотеки хранятся в файле `/modules/vendors.js`, который подключается на всех страницах.  
Это позволяет использовать преимущества пакетного менеджера [npm](https://www.npmjs.com/) и сборщика модулей [webpack](https://webpack.js.org/).  
Если зависимости не объеденять, а добавлять в каждый модуль, то итоговый размер будет больше.

По той же причине служебный механизм сборки модулей [webpack](https://webpack.js.org/) вынесен в [отдельный файл](https://webpack.js.org/configuration/optimization/#optimizationruntimechunk) `/modules/runtime.js`.

## Пример написания своей библиотеки

Напишем библиотеку, которая будет приветствовать пользователя.  
Создадим рабочие файлы
```bash
├── resources
      └── src
          └── hello
              ├── say-hello.js
              └── user.js
```
say-hello.js
```js
export default (user) => `Hello, ${user}`;
```
user.js
```js
export const getUser = () => mw.user.isAnon() ? mw.message('js-libraries-stranger').text() : mw.user.getName();
```
Создадим файл реэкспорта
```bash
├── resources
      └── exposes
            └── hello
                  └── hello.js
```
```js
export { default } from '../../src/hello/say-hello';
export * from '../../src/hello/user';
```
Выполним `npm run affix`.
```js
├── modules
      ├── hello
      │     └── hello.js
      └── runtime.js
```
```json
{
  "ResourceModules": {
    "ext.JSLibraries.hello.hello": {
      "packageFiles": [
        "hello/hello.js"
      ],
      "styles": [],
      "dependencies": [
        "ext.JSLibraries.runtime"
      ]
    },
    "ext.JSLibraries.runtime": {
      "packageFiles": [
        "runtime.js"
      ]
    }
  }
}
```
Что бы заработало нужно добавить зависимость `mediawiki.user`и перевод из `i18n/ru`
```json
{
  "ext.JSLibraries.hello.hello": {
    "packageFiles": [
      "hello/hello.js"
    ],
    "styles": [],
    "dependencies": [
      "mediawiki.user",
      "ext.JSLibraries.runtime"
    ],
    "messages": [
      "js-libraries-stranger"
    ]
  }
}
```
При пересборке файлов, зависимости и переводы не потеряются.

Подключим модуль в стороннем раcширении
```json
{
  "ext.example": {
    "scripts": [
      "resources/example.js"
    ],
    "dependencies": [
      "ext.JSLibraries.hello.hello"
    ]
  }
}
```
```js
const hello = require('ext.JSLibraries.hello.hello');
const { getUser } = hello;
const sayHello = hello.default;

alert(sayHello(getUser()));
```

## Пример подключения внешней библиотеки

Для примера, подключим библиотеку [vuematerial](https://www.creative-tim.com/vuematerial)  
Устанавливаем `npm install vue-material --save`  
Создаем файл `resources/exposes/vue-material/ui.js`
```js
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
export * from 'vue-material/dist/components';
```
Предположим, что необходимо добавить кастомные стили. Создаем дополнительный файл стилей `resources/exposes/vue-material/ui.style.less`.
```bash
├── exposes
      └── vue-material
              ├── ui.js
              └── ui.style.less
```
Собираем модули `npm run affix`.
```bash
├── modules
      ├── runtime.js
      ├── vendors.js
      ├── vendors.js.LICENSE.txt
      └── vue-material
              ├── ui.css
              ├── ui.js
              └── ui.style.css
```
```json
{
  "ResourceModules": {
    "ext.JSLibraries.runtime": {
      "packageFiles": [
        "runtime.js"
      ],
      "styles": []
    },
    "ext.JSLibraries.vendors": {
      "packageFiles": [
        "vendors.js"
      ],
      "styles": []
    },
    "ext.JSLibraries.vue-material.ui": {
      "packageFiles": [
        "vue-material/ui.js"
      ],
      "dependencies": [
        "ext.JSLibraries.runtime"
      ],
      "styles": [
        "vue-material/ui.css",
        "vue-material/ui.style.css"
      ]
    }
  }
}
```

Подключаем в стороннем расширении.

```json
{
  "ResourceModules": {
    "ext.example": {
      "packageFiles": [
        "resources/init.js"
      ],
      "dependencies": [
        "vue",
        "@vue/composition-api",
        "vuex",
        "web2017-polyfills",
        "ext.JSLibraries.vue-material.ui"
      ]
    }
  }
}
```
**Важно!** Требуется обязательное подключение модуля `vue` если в JSLibraries [настройка](#settings) `useMediawikiVue: true` (по умолчанию).

Используем
```js
  const Vue = require( 'vue' );
  const { MdButton } = require('ext.JSLibraries.vue-material.ui');
  
  Vue.use(MdButton);
```
```vue
<template>
  <div>
    <md-button class="md-raised md-primary">Primary</md-button>
  </div>
</template>
```

