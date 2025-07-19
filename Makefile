@PHONY: database_up database_down

database_up:
	docker run --name mysql-db \
		-e MYSQL_ROOT_PASSWORD=12345678 \
		-e MYSQL_DATABASE=db \
		-p 3306:3306 \
		-d mysql:latest

	docker run -it -d --name redis-db -p 6379:6379 redis:latest

database_down:
	docker rm -f mysql-db
	docker rm -f redis-db
