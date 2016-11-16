#include <iostream>
#include <stdlib.h>
#include <fstream>

#include <cppcms/application.h>
#include <cppcms/applications_pool.h>
#include <cppcms/service.h>
#include <cppcms/http_response.h>
#include <cppcms/url_dispatcher.h>
#include <cppcms/url_mapper.h>

#include "content.hpp"

const std::string ACCESS_CONTROL_HEADER = "Access-Control-Allow-Origin";
const std::string ACCESS_CONTROL_VALUE = "*";
const std::string STATIC_FILES_DIR = "static/";

class hello : public cppcms::application {
    private:
        void addOriginHeader(cppcms::http::response* response);

        void serveFile(std::string name);

    public:
        hello(cppcms::service &srv) : cppcms::application(srv) {
            dispatcher().assign("/test", &hello::test, this);
            mapper().assign("test", "/test");

            // todo make regex secure as can browse paths
            dispatcher().assign("/static/(.*)", &hello::serveFile, this, 1);
        }

        void test();
};

void hello::addOriginHeader(cppcms::http::response* response) {
    response->set_header(ACCESS_CONTROL_HEADER, ACCESS_CONTROL_VALUE);
}

void hello::serveFile(std::string name) {
    addOriginHeader(&response());
    std::ifstream f((STATIC_FILES_DIR + name).c_str());
    if (!f) {
        response().status(404);
    } else {
        response().out() << f.rdbuf();
    }
}

void hello::test() {
    addOriginHeader(&response());
    response().out() << "<h2>aaaaaaa</h2>";
}

int main(int argc, char ** argv) {
    try {
        cppcms::service srv(argc, argv);
        srv.applications_pool().mount(
            cppcms::applications_factory<hello>()
        );
        srv.run();
    } catch (std::exception const &e) {
        std::cerr << e.what() << std::endl;
    }
}
