# Режим работы 
DEBUG:bool = True
# Имя проекта
project_name:str = "project_name"
# Путь для скомпилированных статических файлов 
path_public:str = f"/{project_name}/static/public"
# Путь ко всем статическим файлам
path_static:str = f"/{project_name}/static/"

class Nginx:
    # Внешний и Внутренний порт для `nginx`. EXTERNAL_WEB_PORT != NGINX_PORT <!Изменить значеня на свои>
    PORT:int = 8080
    # Путь к рабочей директории
    WORK_DIR:str = f"/usr/src/{project_name}"
    # Внешний порт <!Изменить значения на свои>
    EXTERNAL_PORT:int = 8080

"""
Конфигурации
"""
env = ("__env.env","./",
"""
# (!) - обозначает что нельзя изменять имя ПО, так как его используют официальное образы.
## Django
# Ключ для расшифровки сессии
# DJANGO_SECRET_KEY="django-insecure-@jt^$2(a!%rl%hs8^y@hu^am^+6h^rg4pwo*kp8d@1!+!5gl=i"
# Имя проекта
NAME_PROJ="$$(project_name)$$"
# Режим работы (true/false)
DEBUG=$$(DEBUG)$$
### Docker
# Путь к рабочей директории
WORK_DIR="$$(WORK_DIR)$$"
# Путь к переемным окружениям
PATH_ENV="./__env.env"
# Внешний порт <!Изменить значения на свои>
EXTERNAL_WEB_PORT=$$(EXTERNAL_WEB_PORT)$$
# Внешний и Внутренний порт для `nginx`. EXTERNAL_WEB_PORT != NGINX_PORT <!Изменить значеня на свои>
NGINX_PORT=$$(NGINX_PORT)$$
# ### Postgres
# #  Имя БД (!) <!Изменить значения на свои>
# POSTGRES_DB="postgres"
# # Имя пользователя (!) <!Изменить значения на свои>
# POSTGRES_USER="postgres"
# # Пароль от пользователя (!) <!Изменить значения на свои>
# POSTGRES_PASSWORD="postgres"
# # Имя сервиса(контейнера)
# POSTGRES_HOST="db"
# # Порт подключения к БД. (По умолчанию 5432)
# POSTGRES_PORT=5432
# # Путь к зеркальной папке с БД
# POSTGRES_VOLUMES="./db/pg_data"
"""[1:],
{
"WORK_DIR":Nginx.WORK_DIR,
"project_name":project_name,
"NGINX_PORT": Nginx.PORT,
"EXTERNAL_WEB_PORT": Nginx.EXTERNAL_PORT,
"DEBUG":"true" if DEBUG else "false"
}
)
npm = (
    "package.json", "./",
"""
{
	"name": "$$(project_name)$$",
	"version": "1.0.0",
	"description": "...",
	"private": true,
	"scripts": {
		"/1": "Запустить автоматически перезагружаемый сервер [--mode development]",
		"dev": "webpack serve --config $$(webpack_path)$$",
		"/2": "Собрать проект `JS`. Для оптимизированной сборки измените `__env.env->DEBUG='false'` или [--mode production]",
		"build": "webpack --config $$(webpack_path)$$",
		"/3": "Получить данные о размере банглов",
		"status": "webpack --config $$(webpack_path)$$ --json >status.json && webpack-bundle-analyzer status.json"
	},
	"author": "...",
	"license": "ISC",
	"devDependencies": {
		"@types/webpack": "4.1.4",
		"clean-webpack-plugin": "^4.0.0",
		"copy-webpack-plugin": "^10.2.0",
		"css-loader": "^6.5.1",
		"file-loader": "^6.2.0",
		"html-webpack-plugin": "^5.5.0",
		"loader": "^2.1.1",
		"mini-css-extract-plugin": "^2.4.5",
		"optimize-css-assets-webpack-plugin": "^6.0.1",
		"sass": "^1.45.0",
		"sass-loader": "^12.4.0",
		"style-loader": "^3.3.1",
		"svelte-loader": "^3.1.2",
		"terser-webpack-plugin": "^5.3.0",
		"ts-loader": "^6.2.1",
		"typescript": "^3.9.10",
		"webpack": "^5.67.0",
		"webpack-bundle-analyzer": "^4.5.0",
		"webpack-cli": "^4.9.2",
		"webpack-dev-server": "^4.7.3"
	},
	"dependencies": {
		"bootstrap": "^5.1.3",
		"dotenv": "^10.0.0",
		"svelte": "^3.46.4"
	}
}
"""[1:],
{
"project_name":project_name,
"webpack_path": f"{project_name}/webpack.config.js"
}
)

gitignore = (
    ".gitignore","./",
"""
/__pycache__
/node_modules
$$(path_static)$$
/__pycache__
"""[1:],
{ 
"path_static":path_public,
}
)

nginx = (
    "default.conf","./nginx",
    """
server {
    listen $$(NGINX_PORT)$$
    default_server;
    # Задаёт максимально допустимый размер тела запроса клиента.
    client_max_body_size 4G;
    location = /favicon.ico {
        access_log off; log_not_found off;
    }
    # Раздача `index.html`
    location / {
        root $$(root_path)$$;
    }
    # Раздача статических файлов
    # http://127.0.0.1:$$(NGINX_PORT)$$/static/frontend_react/public/index.html
    location /static/ {
        alias $$(static_path)$$;
    }
    # Раздача медиа файлов
    #location /media/ {
    #        root  $Work_dir/$Name_proj/media;
    #}
}
    """[1:],
{
"NGINX_PORT":Nginx.PORT,
"WORK_DIR":Nginx.WORK_DIR,
"NAME_PROJ":project_name,
"static_path":f"{Nginx.WORK_DIR}{path_static}",
"root_path":f"{Nginx.WORK_DIR}{path_public}",
}
)

export_var = [env, npm, gitignore, nginx]