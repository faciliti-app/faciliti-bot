
# faciliti-bot
Bot responsável por pegar a planilha de empregos do site da prefeitura do recife.

# Para rodar:

 - [Baixe o docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
 - Vá até a pasta do projeto e rode o build da aplicação:
 `docker build -t faciliti-bot .`
> Talvez dê erro o erro: "*failed to dial gRPC: cannot connect to the Docker daemon. Is...*" Caso isso ocorra, rode com sudo 
 - Quando o build terminar, inicie a aplicação:
	`sudo docker run -it faciliti-bot`