
#### 功能
一个npm包，npm 拉取全局之后，可以在shell中流式获取大模型调用，前提配置好 model、name、api-key。

优点： 完全自己在terminal 中直接使用；只对程序猿友好；可切换不同model，目前需要源代码添加；可以自己选择历史几条数据；

### 使用方式
* 拉取包
* 选择模型
* chmod 555 ./install.sh  ./uninstall.sh
* ./install.sh [-k xxx] [-v xxxx](可以多次添加key)

#### todo:
* 命令行管理模型
* 记忆选择当前模型类型
