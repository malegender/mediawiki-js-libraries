- [Описание](#description)
  - [Использование Vue](#about-vue)
  - [Структура каталогов](#directory-structure)
  - [Структура файлов модулей](#modules-structure)
  - [Структура ResourceModules](#resource-modules-structure)
  - [Настройки расширения](#extension-settings)
  - [Настройки сборки](#build-settings)
- [Использование](#usage)
  - [Ограничения](#restriction)
  - [Рабочие сценарии](#scripts)
  - [Заметки](#notes)
- [Пример написания своей библиотеки](#your-library-example)
- [Пример подключения внешней библиотеки](#external-library-example)
- [Динамический компонент из модуля](#module-component)
  - [Описание](#module-component-description)
  - [Использование](#module-component-usage)
  - [Api](#module-component-api)
- [Функция парсера для подключения модуля](#jslibrariesloader)
  - [Описание и мотивация](#jslibrariesloader-description)
  - [Использование](#jslibrariesloader-usage)
  - [Ограничения](#jslibrariesloader-restriction)
  - [Пример подключения Vue приложения в викиразметке](#jslibrariesloader-example)

## <a name="description">Описание</a>

Расширение создано для использования [npm](https://www.npmjs.com/) пакетов на платформе [mediawiki](https://www.mediawiki.org/wiki/MediaWiki).  
При сброке модулей используется [webpack 5](https://webpack.js.org/) с поддержкой ECMAScript 6.  
В качестве препроцессора стилей используется [less](https://lesscss.org/).

### <a name="about-vue">Использование Vue</a>

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

### <a name="directory-structure">Структура каталогов</a>
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

### <a name="modules-structure">Структура файлов модулей</a>

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

### <a name="resource-modules-structure">Структура ResourceModules в extension.json</a>

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
### <a id="extension-settings">Настройки расширения</a>

| Название          | По умолчанию | Описание |
| ----------------- | ------------ | -------- |
| `$wgJSLibrariesLoader` | `false`       | Включает [функцию парсера jslibrariesloader](#jslibrariesloader) |
| `$wgJSLibrariesLoaderPostfix` | `.wikitext` | [Постфикс](#jslibrariesloader-restriction) для наименования модуля подключаемого через [функцию парсера jslibrariesloader](#jslibrariesloader) |

### <a id="build-settings">Настройки сборки</a>

Изменить настройки сборки можно в файле `jsl.config.js`

| Название          | По умолчанию | Описание |
| ----------------- | ------------ | -------- |
| `useMediawikiVue` | `true`       | Если включено, то использует экземпляр Vue из Mediawiki |

## <a id="usage">Использование</a>

* Установите [npm](https://www.npmjs.com/)  
* Установите пакеты `npm install`
* Установите необходимую библиотеку `npm i --save package-name`
* В каталоге `/resources/exposes` разместите файлы реэкспорта npm пакета или файлы собственных библиотек.
Файлы могут быть js или css. __Важно!__ _Файлы стилей с суфиксом `.style` не будут импортироваться в `js` файлы.
Они будут скомпилированны отдельно._
* Собрать и зарегистрировать модули `npm run affix`
* Модули можно использовать в любом месте платформы `mediawiki`.

### <a id="restriction">Ограничения</a>

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

### <a id="scripts">Рабочие сценарии</a>

`npm run affix` - очищает `/modules`, собирает файлы из `/resources/exposes` в `/modules`, генерирует `/extension.json`.  
`npm run build` - очищает `/modules`, собирает файлы из `/resources/exposes` в `/modules`.  
`npm run clean` - очищает `/modules`.  
`npm run extension` - генерирует `/extension.json`.

### <a id="notes">Заметки</a>

Все библиотеки хранятся в файле `/modules/vendors.js`, который подключается на всех страницах.  
Это позволяет использовать преимущества пакетного менеджера [npm](https://www.npmjs.com/) и сборщика модулей [webpack](https://webpack.js.org/).  
Если зависимости не объеденять, а добавлять в каждый модуль, то итоговый размер будет больше.

По той же причине служебный механизм сборки модулей [webpack](https://webpack.js.org/) вынесен в [отдельный файл](https://webpack.js.org/configuration/optimization/#optimizationruntimechunk) `/modules/runtime.js`.

## <a id="your-library-example">Пример написания своей библиотеки</a>

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
export { default } from '@src/hello/say-hello';
export * from '@src/hello/user';
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

## <a id="external-library-example">Пример подключения внешней библиотеки</a>

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

## <a id="module-component">Динамический компонент из модуля</a>
### <a id="module-component-description">Описание и мотивация</a>
Vue компонент поволяющий подключать во Vue приложения компоненты зарегистрировнные в дургих расширениях.  
__Пример__: Использование во Vue приложении в скине, компонента из стороннего расширения.  
__Проблема__: Отключение расширения с компонентом, приведет к падению всего Vue приложения.  
__Решение__: ModuleVueComponent позволяет подгружать компонент из любого модуля в "рантайме" средствами JS mediawiki.

### <a id="module-component-usage">Использование</a>
Пример компонента Hello в расширении MyExtension.
```vue
<template>
  <p>
    <slot></slot>
    <slot name="test"></slot>
	{{ say }}
  </p>
</template>

<script>
module.exports = exports = {
  props: {
    say: String
  }
};
</script>
```
Регистрация Hello в `extension.json`
```json
{
  "ResourceModules": {
    "ext.MyExtension.Hello": {
      "packageFiles": [
        "resources/hello.vue"
      ],
      "dependencies": [
        "vue"
      ]
    }
  }
}
```
Регистрация ModuleVueComponent в `skin.json`, или в `extension.json` любого другого расширения, где будем использовать
```json
{
  "ResourceModules": {
    "MySkin.Page": {
      "packageFiles": [
        "resources/init.js",
        "resources/App.vue"
      ],
      "dependencies": [
        "vue",
        "ext.JSLibraries.DynamicModule.VueComponent"
      ]
    }
  }
}
```
Регистрация ModuleComponent во Vue приложении `init.js`
```js
  const Vue = require("vue");
  const App = require("./App.vue");
  const ModuleVueComponent = require("ext.JSLibraries.DynamicModule.VueComponent").default;
  const app = Vue.createMwApp(App);
  
  app.component('module-component', ModuleVueComponent);
  app.mount(document.getElementById('vue-page'));
```
Использование в `App.vue`
```vue
<template>
    <module-component name="ext.MyExtension.Hello" :say="hello">
      Скажи
      <template #test>
        миру
      </template>
    </module-component>
</template>
<script>
module.exports = exports = {
  name: "App",
  data() {
    return {
      hello: 'Привет!'
    }
  }
};
</script>
```
Итогом будет `Скажи миру Привет!`
### <a id="module-component-api">API компонента</a>
Компонент основан на использовании [асинхронных компонентов Vue](https://ru.vuejs.org/guide/components/async).    
Использует [компонент Suspense](https://vuejs.org/guide/built-ins/suspense.html).
Доступны параметры и события [API Suspense](https://vuejs.org/api/built-in-components#suspense).

#### Events
@fail - вызывается, если загрузка компонента завершилась ошибкой.

## <a id="jslibrariesloader">Функция парсера для подключения модуля</a>

### <a id="jslibrariesloader-description">Описание и мотивация</a>
Иногда бывает сложно вставить скрипт на отдельную страницу или в викитекст.  
Функция парсера `jslibrariesloader` добавляет на страницу указанный модуль.

### <a id="jslibrariesloader-usage">Использование</a>
Синтаксис вызова в викитесте `{{#jslibrariesloader:modulename}}` или `{{#jslibrariesloader:modulename.style}}`.    
Можно указать несколько разных модулей `{{#jslibrariesloader:modulename|modulename.style|modulename2}}`.  
__Важно!__ _Если указан суффикс `.style`, то подключение будет через `ParserOutput::addModuleStyles`, иначе `ParserOutput::addModules`._  

### <a id="jslibrariesloader-restriction">Ограничения</a>
Для безопасности, эта функция может подключать только модули с определенным постфиксом в имени.
Постфикс настраивается параметром `$wgJSLibrariesLoaderPostfix`. 

### <a id="jslibrariesloader-example">Пример подключения Vue приложения в викиразметке</a>

В произвольном расширении создадми Vue приложение
```bash
├── resources
      ├── App.vue
      └── init.js
├── extension.json
```
Содержимое `App.vue`:
```vue
<template>
	<div>Hello World!</div>
</template>

<script>
export default {
	name: "HelloWorld",
}
</script>
```
Содержимое `init.js`:
```js
const Vue = require('vue');
const App = require('./App.vue');
const app = Vue.createMwApp(App);

app.mount('#hello-world');
```
Регистрация в файле `extension.json`:

```json
{
  "ResourceModules": {
    "ext.hello.world.wikitext": {
      "packageFiles": [
        "resources/App.js",
        "resources/init.js"
      ]
    }
  }
}
```
__Важно!__ _Название модуля ДОЛЖНО содержать [постфикс](#jslibrariesloader-description) из [настройки](#extension-settings) `$wgJSLibrariesLoaderPostfix`. В примере `.wikitext`._

Создаем страницу шаблон `/wiki/Шаблон:Подключение_vue_приложения`:
```
<div {{#if:{{{id|}}}|id="{{{id}}}"|}} {{#if:{{{class|}}}|class="{{{class}}}"|}}></div>
{{#jslibrariesloader:{{{module}}}}}
```
Размещаем на нужную страницу в викитексте:
```
{{Подключение vue приложения|id=hello-world|module=ext.hello.world}}
```
__Важно!__ _[Постфикс](#jslibrariesloader-description) не используем в викитексте. Т.е. `ext.hello.world` НЕ `ext.hello.world.wikitext`._  
__Важно!__ _Необходимо указывать id в шаблоне, такой же как при монтировании vue приложения. В примере `hello-world`._

Результат на странице: `Hello world!`.
