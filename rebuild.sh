docker compose stop frontend    
docker compose rm -f frontend
docker compose up -d --build frontend


docker compose stop frontend; docker compose rm -f frontend; docker compose up -d --build frontend

docker compose stop backend; docker compose rm -f backend; docker compose up -d --build backend