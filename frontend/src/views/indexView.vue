<template>
  <div>
    <!-- 输入框和粘贴按钮 -->
    <input
      type="text"
      ref="linkInput"
      placeholder="paste the link here"
      class="link_input"
      v-model="pastedLink"
    />
    <button class="paste_button" @click="pasteFromClipboard">paste</button>

    <!-- 新增：下载按钮 -->
    <button
      class="download_button"
      @click="sendLinkToBackend"
      :disabled="isLoading || !pastedLink.trim()"
    >
      {{ isLoading ? "Downloading..." : "Download" }}
    </button>

    <!-- 消息显示区域 -->
    <p v-if="message" :class="['message', messageType]">{{ message }}</p>
  </div>
  <div>
    <p class="main">
      supported services: {{ platform1 }}, {{ platform2 }},{{ platform3 }},{{
        platform4
      }}
    </p>
  </div>
</template>

<script>
import axios from "axios"; // 1. 引入 axios

export default {
  data() {
    return {
      pastedLink: "",
      message: "",
      messageType: "error", // 用于控制消息样式 ('success' 或 'error')
      platform1: "X/Twiiter",
      platform2: "Youtube",
      platform3: "Bilibili",
      platform4: "Tiktok",
      isLoading: false, // 2. 添加加载状态
    };
  },
  methods: {
    // 粘贴方法 (保持不变)
    async pasteFromClipboard() {
      // ... (你原来的 pasteFromClipboard 代码) ...
       this.message = ""; // 清空之前的提示信息
       this.messageType = 'error'; // 重置消息类型

      if (!navigator.clipboard) {
        this.message = "您的浏览器不支持剪贴板 API，无法粘贴。";
        console.error("Clipboard API not supported.");
        return;
      }
      try {
        const clipboardText = await navigator.clipboard.readText();
        this.pastedLink = clipboardText;
        // this.message = '内容已成功粘贴！'; // 粘贴成功一般不需要提示
        // this.messageType = 'success';
      } catch (err) {
        console.error("无法读取剪贴板内容:", err);
        if (err.name === "NotAllowedError") {
          this.message =
            "需要允许访问剪贴板权限才能粘贴。请检查浏览器设置或重试。";
        } else {
          this.message = "读取剪贴板内容时发生错误。";
        }
         this.messageType = 'error';
      }
    },

    // 3. 新增：发送链接到后端的方法
    async sendLinkToBackend() {
      if (!this.pastedLink.trim()) {
        this.message = "链接不能为空！";
        this.messageType = "error";
        return;
      }

      this.isLoading = true; // 开始加载
      this.message = ""; // 清空旧消息

      try {
        // --- 发送 POST 请求 ---
        // 重要：将 '/api/download' 替换为你的实际后端 API 地址
        // 如果 Vue 开发服务器和 Spring Boot 不在同一端口，需要写完整 URL
        // 例如: 'http://localhost:8080/api/download'
        const response = await axios.post("/api/download", {
          url: this.pastedLink, // 将链接放在请求体中，键名为 'url'
        });
        // ---------------------

        // 请求成功
        console.log("后端响应:", response.data);
        this.message = response.data.message || "请求成功，下载已开始！"; // 显示后端成功消息
        this.messageType = "success";
        // this.pastedLink = ""; // 可选：成功后清空输入框

      } catch (error) {
        // 请求失败
        console.error("请求后端时出错:", error);
        this.messageType = "error"; // 肯定是错误消息
        if (error.response) {
          // 服务器返回了错误状态码 (例如 4xx, 5xx)
          this.message = `错误: ${
            error.response.data.error || error.response.statusText || "未知服务端错误"
          }`;
        } else if (error.request) {
          // 请求已发出，但没有收到响应
          this.message = "错误: 无法连接到服务器，请检查网络或后端服务。";
        } else {
          // 设置请求时发生其他错误
          this.message = `错误: ${error.message}`;
        }
      } finally {
        this.isLoading = false; // 结束加载
      }
    },
  },
};
</script>

<style scoped>
/* ... (你原来的 CSS 样式) ... */

.main {
  font-family: Ayuthaya, sans-serif;
  font-size: 20px;
  margin-left: 10px;
}
div {
  font-family: Ayuthaya, sans-serif;
  display: flex;
  align-items: center;
  /* 允许多行显示时换行 */
  flex-wrap: wrap;
}

.link_input {
  margin: 10px;
  font-family: inherit;
  width: 600px;
  height: 38px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 16px;
}

/* 调整按钮间距 */
.paste_button, .download_button {
  font-family: inherit;
  height: 40px;
  padding: 5px 10px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, opacity 0.3s ease;
  margin-left: 10px; /* 给按钮之间加点左边距 */
}

.paste_button {
  width: 80px;
  background-color: steelblue;
}
.paste_button:hover {
  background-color: darkblue;
}

/* 下载按钮样式 */
.download_button {
  width: 120px; /* 可以调整宽度 */
  background-color: #28a745; /* 绿色 */
}
.download_button:hover:not(:disabled) { /* 悬停且非禁用时 */
  background-color: #218838; /* 深绿色 */
}

/* 按钮禁用时的样式 */
.download_button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 消息样式 */
.message {
  font-family: Ayuthaya;
  margin-left: 10px;
  font-size: 14px;
  /* 让消息单独占一行或有足够空间 */
  width: 100%; /* 可选，让消息占满 flex 容器的剩余宽度或换行 */
  margin-top: 5px;
}

.message.error { /* 默认是 error 类型 */
  color: red;
}

.message.success {
  color: green;
}
</style>