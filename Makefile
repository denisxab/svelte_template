env_path=__env.env
include $(env_path)
export NAME_PROJ, WORK_DIR, NGINX_PORT


## Переменные
# Имя контейнера `nginx`
nginx_container_name:=${NAME_PROJ}_nginx_cont
# Имя образа `nginx`
nginx_image_name:=$(NAME_PROJ)_nginx_img
# Текущую директория
my_path=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
####

# Создать образ проекта
docker_build:
	sudo docker build -t $(nginx_image_name) --build-arg WORK_DIR=$(WORK_DIR) ./nginx;

# Создать и запустить контейнер с проектом
docker_run:
	docker run --rm -ti --name $(nginx_container_name) --env-file $(env_path) -v $(my_path):$(WORK_DIR) -p $(NGINX_PORT):$(NGINX_PORT) $(nginx_image_name);

# Подключиться к контейнеру c nginx
docker_exe:
	docker exec -ti $(nginx_container_name) /bin/sh;

# Получить файл конфигураций `nginx`
docker_nginx_conf:
	docker exec -ti $(nginx_container_name) cat /etc/nginx/conf.d/default.conf

# Запутсить сервер для разработки
dev:
	npm run dev

# Скомпелировать конфигурационные файлы
compile_env:
	./configer.bin ./conf.py;