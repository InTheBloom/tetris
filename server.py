from livereload import Server

server = Server()
server.watch('./*')
server.watch('./src/*')

server.serve(root='./');
