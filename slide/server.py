from livereload import Server
from livereload import shell

server = Server()
build = shell("marp --html presentation.md")
server.watch('presentation.md', func = build)

server.serve(root='./');
