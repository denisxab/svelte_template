class Main {
	constructor(isDev, PathOutStatic, PathSrc, PathByUrl) {
		this.isDev = isDev;
		// Путь для статический файлов после компиляции
		this.PathOutStatic = PathOutStatic;
		this.PathSrc = PathSrc;
		this.PathByUrl = PathByUrl;

		console.log(this.PathByUrl);
		this.res = {
			// Режим работы [production(сжатие кода)/development]
			mode: isDev ? 'development' : 'production',

			// Вариант сборки https://webpack.js.org/configuration/devtool/
			devtool: this.DevTool(),

			// Путь для входных файлов
			entry: this.Entry(),

			// Путь для выходных файлов после компиляции
			output: this.Output(),

			// Оптимизировать импорты сторонних библиотек
			optimization: this.optimization(),

			// Файлы с каким расширением мы подключаем без указания расширения
			resolve: {extensions: ['.ts', '.tsx', '.js', '.svelte']},

			// Список используемых плагинов
			plugins: this.Plugins(),

			// Настройки для различных форматов файлов (предпроцессоры)
			module: {
				// конфигурация относительно модулей
				rules: [
					/* Обработка импортов различных типов фалов */
					//// JS
					// this.JS_load(),
					//// TS
					// this.TS_load(),
					// SVELTE
					this.SVELTE_load(),
					// CSS
					this.CSS_load(),
					// SASS-SCSS
					this.SASS_load(),
					// File
					this.FILE_load(),
					// Fonts
					this.FONTS_load(),
				],
			},

			// Настройка `webpack-dev-server`
			devServer: this.DevServer(),

			// Увеличить максимальный размер статических файлов
			performance: {
				hints: false,
				maxEntrypointSize: 512000,
				maxAssetSize: 512000,
			},
		};
	}

	// Настройка указывающая -> нужно ли создавать хешь в имени файлов
	filename(ext) {
		/* В режиме разработки хеш нам не нужно. Но когда мы отправляем в релиз файлы, то нам нужен
		хеш файлов, для того чтобы пользователи не кешировали устаревшие статические файлы, а загружали новые,
		это будет происходить потому что имена файлов будут разными.
		*/
		return this.isDev
			? `[name].bundle.${ext}`
			: `[name].[contenthash].${ext}`;
	}

	// Функция для настроек оптимизации (сжатия) файлов
	optimization() {
		// Оптимизировать импорты сторонних библиотек
		const conf = {
			splitChunks: {
				chunks: 'all',
			},
		};
		// Если не режим разработки то сжимаем `JS` и `CSS`
		if (!this.isDev) {
			conf.minimize = true;
			conf.minimizer = [
				new OptimizeCssAssetsPlugin(),
				new TerserPlugin(),
			];
		}
		return conf;
	}

	// Функция для подключения плагинов
	Plugins() {
		let plug = [
			// Плагин для автоматического подключения статических файлов в `HTML` шаблон
			new HTMLWebpackPlugin({
				// Указать какой `HTML` шаблон взять за основу
				template: path.resolve(
					__dirname,
					`${this.PathSrc}/index.template.html`,
				),
				// Куда поместить итоговый `HTMl` файл
				filename: path.resolve(
					__dirname,
					`${this.PathOutStatic}/index.html`,
				),
				// Оптимизировать сборку `HTMl`файла если не режим разработки
				minify: {
					// Варианты: https://github.com/terser/html-minifier-terser#options-quick-reference
					collapseWhitespace: !this.isDev,
					keepClosingSlash: !this.isDev,
					removeComments: !this.isDev,
					removeRedundantAttributes: !this.isDev,
					removeScriptTypeAttributes: !this.isDev,
					removeStyleLinkTypeAttributes: !this.isDev,
					useShortDoctype: !this.isDev,
				},
			}),
			// Удалять старые версии статических файлов из `output`
			new CleanWebpackPlugin(),
			// Создать общий `.css` файл со стилями
			new MiniCssExtractPlugin({
				filename: this.filename('css'),
			}),
			// // Копировать файлы или папки при сборки проекта
			// new CopyWebpackPlugin([
			//         // Копирование
			//         {
			//             // Откуда копировать
			//             from: path.resolve(__dirname,``),
			//             // Куда копировать
			//             to: path.resolve(__dirname,``)
			//         },
			//     ]
			// )
		];
		// Если режим разработки то показать размер статических файлов
		if (!this.isDev) {
			plug.push(new BundleAnalyzerPlugin());
		}
		return plug;
	}

	DevTool() {
		return this.isDev ? 'source-map' : false;
	}

	Entry() {
		return {
			// Его мы подключаем в `index.html`
			main: path.resolve(__dirname, `${this.PathSrc}/main.js`),
			// Путь к другому файлу для компиляции
			// other: path.resolve(__dirname, `src/other.tsx`)
		};
	}

	Output() {
		return {
			// Имя выходного файла.
			// `name` возьмётся из ключа `entry`.
			// `contenthash` будет создавать хеш файла для индивидуальности
			filename: this.filename('js'),
			// Путь куда помещаются скомпилированные файлы
			path: path.resolve(__dirname, `${this.PathOutStatic}/`), // 127.0.0.1/static/frontend_react/public/ откуда подаются файлы
			// Путь который будет в html ссылке
			publicPath: `${this.PathByUrl}`,
		};
	}

	DevServer() {
		return {
			// Порт на котором будет запущен Лайф сервер
			port: 8011,
			devMiddleware: {
				// Записывать изменения в файл, а не в ОЗУ
				writeToDisk: true,
			},
			// Путь к статиечским файлам
			static: {
				directory: path.join(__dirname, `${this.PathOutStatic}/`),
			},
			// Разрешить все домены
			allowedHosts: 'all',
			// Атоперезагрузка если режим разработки
			hot: this.isDev,
		};
	}

	SVELTE_load() {
		return {
			test: /\.svelte$/,
			use: {
				loader: 'svelte-loader',
			},
		};
	}
	JS_load() {
		return {};
	}
	TS_load() {
		return {
			// свойство определяет, какой файл или файлы следует преобразовать.
			test: /\.tsx|ts?$/,
			// Игнорирует папки [node_modules/, bower_components/]
			exclude: /(node_modules|bower_components)/,
			// какой загрузчик следует использовать для преобразования.
			use: 'ts-loader',
		};
	}
	CSS_load() {
		return {
			test: /\.css$/,
			// `css-loader` - поваляет импортировать `.css` в `js`
			// `style-loader` - подключает `.css` в `HTML` (Удален)
			// `MiniCssExtractPlugin`- создавать отдельный `.css` файл
			use: [
				// Настройки для `MiniCssExtractPlugin`
				{
					loader: MiniCssExtractPlugin.loader,
					options: {},
				},
				'css-loader',
			],
		};
	}
	SASS_load() {
		return {
			test: /\.s[ac]ss$/,
			// `css-loader` - поваляет импортировать `.css` в `js`
			// `style-loader` - подключает  `.css` в `HTML` (Удален)
			// `MiniCssExtractPlugin` -  создавать отдельный `.css` файл
			use: [
				// Настройки для `MiniCssExtractPlugin`
				{
					loader: MiniCssExtractPlugin.loader,
					options: {},
				},
				'css-loader',
				'sass-loader',
			],
		};
	}
	FONTS_load() {
		return {
			test: /\.(ttf|woff|woff2|eot)$/,
			use: ['file-loader'],
		};
	}
	FILE_load() {
		return {
			test: /\.(png|jpg|svg|gif|web)$/,
			use: ['file-loader'],
		};
	}
}

// Для относительных путей
const path = require('path');
// https://github.com/jantimon/html-webpack-plugin#options
const HTMLWebpackPlugin = require('html-webpack-plugin');
// https://github.com/johnagan/clean-webpack-plugin
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// https://www.npmjs.com/package/copy-webpack-plugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
// https://webpack.js.org/plugins/mini-css-extract-plugin/
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// https://www.npmjs.com/package/optimize-css-assets-webpack-plugin
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// https://webpack.js.org/plugins/terser-webpack-plugin/
const TerserPlugin = require('terser-webpack-plugin');
// https://www.npmjs.com/package/webpack-bundle-analyzer
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

// Считываем переменные окружения из файла `npm install dotenv`
const envy = require('dotenv').config({path: './__env.env'});
// Получить режим разработки (bool)
const isDev = envy.parsed.DEBUG === 'true';
console.log('isDev:\t\t', isDev);

obj_ = new Main(isDev, './static/public/', './src/', '/static/public/');
console.log(obj_.res);
module.exports = obj_.res;
