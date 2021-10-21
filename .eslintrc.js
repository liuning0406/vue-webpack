// https://eslint.org/docs/user-guide/configuring
// eslint 配置
module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint"
  },
  env: {
    browser: true
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    "plugin:vue/essential",
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    "standard"
  ],
  // required to lint *.vue files
  plugins: ["vue"],
  // add your custom rules here
  rules: {
    // allow async-await
    "generator-star-spacing": "off",
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    // 0表示不不处理，1表示警告，2表示错误并退出
    "space-before-function-paren": [0, "always"], //函数的()前后必须有空格
    "spaced-comment": 0, //注释风格必须有空格
    eqeqeq: [0, "allow-null"], // 是否必须使用 === 替代 ==
    singleQuote: false, //字符串是否使用单引号，默认为false，使用双引号
    quotes: [0, "single"], //引号类型不做限制
    semi: [2, "always"], //语句强制分号结尾
    "no-tabs": "off", //不能使用无必要的空格
    "no-unused-vars": "off", // 有声明了但未使用的变量报警告，由于可能在很远的地方才用到会误报错误，所以关闭
    vars: "local", // 允许声明未使用变量
    "no-multiple-empty-lines": [0, {
      max: 5
    }], //空行最多不能超过5行
    camelcase: [0, {
      properties: "always"
    }] //是否必需使用驼峰命名法
    // TODO: 关于Expected "[" and "]" to be on the same line报错 换行的配置在此处设置无用，根据网上配置在根目录设置的.prettierrc.json 文件内进行配置生效，会覆盖Prettier 插件的换行效果。
    // .prettierrc.json内的singleQuote表示是否强制使用单引号，semi表示是否强制使用';'结尾，printWidth表示每行最多字数,"htmlWhitespaceSensitivity": "ignore" 表示禁止结束标签的>跑到下一行
    // 建议将Prettier插件的换行字数与这里设置成一样的，可以减少eslint的报错，如果编程时 不使用eslint可无视
  }
};
