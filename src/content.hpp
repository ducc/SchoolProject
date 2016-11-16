#include <string>

#include <cppcms/view.h>

namespace content {
    struct message : public cppcms::base_content {
        std::string text;
    }; 
}
