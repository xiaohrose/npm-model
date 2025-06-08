
#### 功能

npm 下载 mc-mp 包，通过命令行  `mc xxx` 使。可以方便的在终端使用大模型；同时可以添加自己的大模型，选择自己喜欢的模型；默认选择一条历史记录，可以选择保留多少历史记录（一次有效）。

后续，将自己的提问保留在自己本机方便自己追溯（目前只保留了相关数据，还没实现浏览历史数据，），接下来准备通过起个本地 web 服务来浏览，自己的历史数据。


##### 使用方式
1， 下载
```bash
npm install mc-mp -g
```
2，本包原理是通过大模型开放接口调用，所以需要去对应模型平台去申请 KEY， 然后在配置 ~/.bashrc 中配置 KEY=xxxx,例如，[deepseek](https://platform.deepseek.com/usage)


2，使用
```bash
#默认 deepseek v3大模型
mc content
# 携带 x 条上下文
mc -n x content
# 切换成 x 模型
mc -t x content
# 配置中的大模型列表
mc list
```

#### todo:
* 浏览历史数据
