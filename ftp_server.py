from pyftpdlib.servers import FTPServer
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.authorizers import DummyAuthorizer

def run_ftp_server():
    authorizer = DummyAuthorizer()

    # Add a user with full permissions (username: user, password: 12345)
    authorizer.add_user("user", "12345", ".", perm="elradfmwMT")

    # Optionally, add an anonymous user with restricted access
    # authorizer.add_anonymous(".")

    handler = FTPHandler
    handler.authorizer = authorizer

    # Start FTP server on port 2121 (use 21 for default FTP, but may require sudo)
    address = ("0.0.0.0", 2121)
    server = FTPServer(address, handler)

    print("FTP server running on ftp://localhost:2121")
    server.serve_forever()

if __name__ == "__main__":
    run_ftp_server()
