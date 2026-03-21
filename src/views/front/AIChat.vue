<template>
  <div class="ai-chat-page">
    <!-- 页面标题栏 -->
    <div class="chat-header">
      <div class="header-left">
        <el-button text @click="$router.back()" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>

        <div class="ai-info">
          <div class="ai-avatar">
            <el-icon :size="20"><MagicStick /></el-icon>
          </div>
          <div class="ai-meta">
            <div class="ai-title-row">
              <span class="ai-name">小书</span>
              <span class="ai-badge">校园 AI 助手</span>
            </div>
            <div class="ai-status">
              <span class="status-dot"></span>
              <span>在线 · 可咨询找书 / 发布 / 购买问题</span>
            </div>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <div class="session-stat">
          <span class="stat-label">本次对话</span>
          <strong>{{ assistantReplyCount }}</strong>
        </div>
        <el-tooltip content="清空对话" placement="bottom">
          <el-button text @click="confirmClear" class="action-btn" :disabled="messages.length === 0">
            <el-icon><Delete /></el-icon>
            <span>清空</span>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 消息列表区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-section">
        <div class="welcome-icon">
          <el-icon :size="48"><MagicStick /></el-icon>
          <div class="icon-pulse"></div>
        </div>

        <h2 class="welcome-title">你好，我是小书！</h2>
        <p class="welcome-desc">
          我可以帮你推荐教材、解释购买流程、指导发布二手书，
          也能根据专业和课程方向给出选书建议。
        </p>

        <div class="intro-panel">
          <div class="intro-chip">
            <el-icon><Reading /></el-icon>
            <span>找专业教材</span>
          </div>
          <div class="intro-chip">
            <el-icon><ShoppingCart /></el-icon>
            <span>了解交易流程</span>
          </div>
          <div class="intro-chip">
            <el-icon><Upload /></el-icon>
            <span>快速发布闲置</span>
          </div>
          <div class="intro-chip">
            <el-icon><Collection /></el-icon>
            <span>按专业推荐书单</span>
          </div>
        </div>

        <!-- 功能卡片 -->
        <div class="feature-cards">
          <div class="feature-card" @click="sendQuickQuestion('有什么算法书推荐吗？')">
            <div class="card-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="card-text">
              <span class="card-title">书籍推荐</span>
              <span class="card-desc">根据课程、方向和预算推荐合适书籍</span>
            </div>
          </div>

          <div class="feature-card" @click="sendQuickQuestion('如何发布一本书？')">
            <div class="card-icon">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="card-text">
              <span class="card-title">发布指导</span>
              <span class="card-desc">快速了解上架步骤、图片与描述要点</span>
            </div>
          </div>

          <div class="feature-card" @click="sendQuickQuestion('购买流程是怎样的？')">
            <div class="card-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="card-text">
              <span class="card-title">购书指南</span>
              <span class="card-desc">从下单到支付、发货到收货一目了然</span>
            </div>
          </div>

          <div class="feature-card" @click="sendQuickQuestion('计算机专业大一用什么教材？')">
            <div class="card-icon">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="card-text">
              <span class="card-title">教材咨询</span>
              <span class="card-desc">按专业、年级和课程推荐常见教材</span>
            </div>
          </div>
        </div>

        <!-- 快捷问题 -->
        <div class="quick-questions">
          <p class="quick-label">可以直接点击这些问题开始：</p>
          <div class="quick-btns">
            <el-button
              v-for="q in quickQuestions"
              :key="q"
              class="quick-btn"
              @click="sendQuickQuestion(q)"
              :loading="sending"
            >
              {{ q }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages-list">
        <div class="conversation-tip">
          对话已自动保存在当前会话中，刷新前可继续查看最近记录。
        </div>

        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-item', msg.role]"
        >
          <!-- AI 头像 -->
          <div v-if="msg.role === 'assistant'" class="message-avatar ai-avatar">
            <el-icon :size="16"><MagicStick /></el-icon>
          </div>

          <!-- 用户头像 -->
          <div v-else class="message-avatar user-avatar">
            <el-icon :size="16"><User /></el-icon>
          </div>

          <!-- 消息气泡 -->
          <div class="message-bubble-wrapper">
            <div class="message-meta">
              <span class="message-role">{{ msg.role === 'assistant' ? '小书' : '我' }}</span>
              <span v-if="msg.time" class="message-time-inline">{{ msg.time }}</span>
            </div>

            <div class="message-bubble">
              <div class="message-content" v-if="msg.role === 'user'">{{ msg.content }}</div>
              <div class="message-content" v-else v-html="formatMessage(msg.content)"></div>
              <span v-if="msg.role === 'assistant' && msg.typing" class="typing-cursor">|</span>
            </div>

            <div class="message-actions">
              <el-tooltip content="复制" placement="top">
                <button class="action-icon" @click="copyMessage(msg.content)">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </el-tooltip>
            </div>

            <div class="message-time" v-if="msg.time">{{ msg.time }}</div>
          </div>
        </div>

        <!-- AI 思考中 -->
        <div v-if="sending" class="message-item assistant">
          <div class="message-avatar ai-avatar">
            <el-icon :size="16"><MagicStick /></el-icon>
          </div>
          <div class="message-bubble-wrapper">
            <div class="message-meta">
              <span class="message-role">小书</span>
              <span class="thinking-text">正在整理回答…</span>
            </div>
            <div class="message-bubble thinking">
              <div class="thinking-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <div class="input-topbar">
        <div class="quick-hints" v-if="!inputMessage.trim()">
          <span class="hint-label">快捷提问：</span>
          <span
            v-for="hint in quickHints"
            :key="hint"
            class="hint-tag"
            @click="inputMessage = hint"
          >
            {{ hint }}
          </span>
        </div>

        <div class="input-meta">
          <span class="enter-tip">Enter 发送 · Shift + Enter 换行</span>
          <span class="char-count" :class="{ warning: inputLength > 400 }">
            {{ inputLength }}/500
          </span>
        </div>
      </div>

      <div class="input-wrapper">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 4 }"
            maxlength="500"
            show-word-limit="false"
            placeholder="请输入你的问题，例如：计算机专业大一适合买哪些教材？"
            @keydown.enter.exact.prevent="handleSend"
            @input="autoResize"
            ref="inputRef"
            :disabled="sending"
            class="chat-input"
          />
        </div>

        <el-button
          type="primary"
          @click="handleSend"
          :disabled="!inputMessage.trim() || sending"
          class="send-btn"
          :class="{ sending: sending }"
        >
          <el-icon v-if="!sending" class="send-icon"><Promotion /></el-icon>
          <span v-if="!sending">发送</span>
          <el-icon v-else class="loading-icon"><Loading /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  MagicStick,
  User,
  Delete,
  Promotion,
  CopyDocument,
  Loading,
  Reading,
  Upload,
  ShoppingCart,
  Collection
} from '@element-plus/icons-vue'
import http from '@/utils/http'

const messages = ref([])
const inputMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const inputRef = ref(null)

const quickQuestions = [
  '有什么算法书推荐吗？',
  '计算机专业大一用什么教材？',
  '如何发布一本书？',
  '购买流程是怎样的？'
]

const quickHints = [
  '推荐几本 Python 书籍',
  '二手书购买注意事项',
  '如何联系卖家'
]

const inputLength = computed(() => inputMessage.value.length)
const assistantReplyCount = computed(() => messages.value.filter(m => m.role === 'assistant').length)

// 格式化时间
const formatTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 加载历史记录（从 sessionStorage）
const loadHistory = () => {
  try {
    const history = sessionStorage.getItem('ai_chat_history')
    if (history) {
      messages.value = JSON.parse(history)
    }
  } catch (e) {
    console.error('加载历史记录失败', e)
  }
}

const isLoggedIn = () => Boolean(localStorage.getItem('token'))

const appendAssistantMessage = async (content) => {
  messages.value.push({ role: 'assistant', content: '', typing: true })
  await scrollToBottom()
  await typewriterEffect(messages.value.length - 1, content)
  messages.value[messages.value.length - 1].time = formatTime()
  saveHistory()
}

// 保存历史记录
const saveHistory = () => {
  try {
    const toSave = messages.value.slice(-30).map(m => ({
      role: m.role,
      content: m.content,
      time: m.time
    }))
    sessionStorage.setItem('ai_chat_history', JSON.stringify(toSave))
  } catch (e) {
    console.error('保存历史记录失败', e)
  }
}

// 发送消息
const handleSend = async () => {
  const content = inputMessage.value.trim()
  if (!content || sending.value) return

  if (!isLoggedIn()) {
    ElMessage.warning('请先登录后再使用 AI 助手')
    return
  }

  inputMessage.value = ''
  if (inputRef.value) {
    inputRef.value.resizeTextarea()
  }

  messages.value.push({
    role: 'user',
    content,
    time: formatTime()
  })
  saveHistory()
  await scrollToBottom()

  sending.value = true

  try {
    const history = messages.value
      .filter(m => m.role !== 'system')
      .slice(0, -1)
      .map(m => ({ role: m.role, content: m.content }))

    const res = await http.post('/chat/send', {
      message: content,
      history
    })

    if (res.data?.code === 0) {
      const reply = res.data?.data?.reply?.trim()
      await appendAssistantMessage(reply || '抱歉，我暂时没有组织好回答，请换个问法再试试。')
    } else {
      const message = res.data?.msg || '发送失败，请稍后重试'
      ElMessage.error(message)
      await appendAssistantMessage(`抱歉，当前无法完成回答：${message}`)
    }
  } catch (e) {
    console.error('发送消息失败', e)
    const status = e.response?.status
    const message =
      status === 401
        ? '登录状态已失效，请重新登录后再试'
        : (e.response?.data?.msg || '网络异常，请稍后重试')
    ElMessage.error(message)
    await appendAssistantMessage(`抱歉，当前无法完成回答：${message}`)
  } finally {
    sending.value = false
    saveHistory()
    await nextTick()
    inputRef.value?.focus()
  }
}

// 打字机效果
const typewriterEffect = async (index, text) => {
  const message = messages.value[index]
  for (let i = 0; i < text.length; i++) {
    message.content += text[i]
    if (i % 5 === 0) {
      await scrollToBottom()
    }
    await sleep(25)
  }
  message.typing = false
  await scrollToBottom()
}

// 辅助函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// 自动调整输入框高度
const autoResize = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.resizeTextarea()
    }
  })
}

// 发送快捷问题
const sendQuickQuestion = async (question) => {
  inputMessage.value = question
  await nextTick()
  handleSend()
}

// 确认清空对话
const confirmClear = () => {
  ElMessageBox.confirm('确定要清空所有对话记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    clearChat()
  }).catch(() => {})
}

// 清空对话
const clearChat = () => {
  messages.value = []
  sessionStorage.removeItem('ai_chat_history')
  ElMessage.success('对话已清空')
}

// 复制消息
const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

// 基础 HTML 转义，避免直接注入原始标签
const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 格式化消息（支持简单 Markdown 风格）
const formatMessage = (content) => {
  if (!content) return ''
  return escapeHtml(content)
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
}

onMounted(() => {
  loadHistory()
  nextTick(() => {
    inputRef.value?.focus()
    scrollToBottom()
  })
})
</script>

<style scoped>
.ai-chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 64px);
  max-width: 920px;
  margin: 0 auto;
  background:
    radial-gradient(circle at top left, rgba(102, 126, 234, 0.12), transparent 28%),
    linear-gradient(180deg, #f8f9fc 0%, #eef1f7 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(80, 102, 180, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

/* 标题栏 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.back-btn {
  font-size: 18px;
  padding: 6px;
  color: #606266;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #667eea;
  background: #f0f2ff;
}

.ai-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.ai-avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.28);
}

.ai-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ai-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-name {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
}

.ai-badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #667eea;
  font-size: 11px;
  font-weight: 600;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #67c23a;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #67c23a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.session-stat {
  min-width: 74px;
  padding: 6px 10px;
  border-radius: 12px;
  background: #f7f8ff;
  border: 1px solid #e6eafc;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #909399;
  line-height: 1.2;
}

.session-stat strong {
  font-size: 16px;
  color: #303133;
}

.action-btn {
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  color: #f56c6c;
  background: #fef0f0;
}

.action-btn:disabled {
  opacity: 0.4;
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 22px;
  scroll-behavior: smooth;
}

/* 欢迎界面 */
.welcome-section {
  text-align: center;
  padding: 30px 20px 36px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-icon {
  width: 84px;
  height: 84px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  position: relative;
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.28);
}

.icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: iconPulse 2s ease-out infinite;
  z-index: -1;
}

@keyframes iconPulse {
  0% { transform: scale(1); opacity: 0.35; }
  100% { transform: scale(1.5); opacity: 0; }
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 10px;
}

.welcome-desc {
  font-size: 14px;
  color: #7b8190;
  margin: 0 auto 22px;
  line-height: 1.8;
  max-width: 620px;
}

.intro-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 28px;
  max-width: 640px;
}

.intro-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #e8ebf7;
  color: #5f6372;
  font-size: 13px;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.06);
}

/* 功能卡片 */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  max-width: 620px;
  margin: 0 auto 28px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.feature-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.12);
  transform: translateY(-3px);
}

.card-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f0f2ff 0%, #e8ebfa 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 18px;
  flex-shrink: 0;
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
}

.card-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* 快捷问题 */
.quick-questions {
  text-align: left;
  max-width: 620px;
  margin: 0 auto;
}

.quick-label {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px;
}

.quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-btn {
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 13px;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f0f2ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conversation-tip {
  align-self: center;
  font-size: 12px;
  color: #8e95a3;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e8ebf5;
  border-radius: 999px;
  padding: 6px 12px;
  margin-bottom: 6px;
}

.message-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.message-avatar.user-avatar {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 74%;
}

.message-item.user .message-bubble-wrapper {
  align-items: flex-end;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 2px 6px;
}

.message-item.user .message-meta {
  justify-content: flex-end;
}

.message-role {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.message-time-inline,
.thinking-text {
  font-size: 11px;
  color: #a0a6b2;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.75;
  word-break: break-word;
  position: relative;
}

.message-item.user .message-bubble {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-item.assistant .message-bubble {
  background: rgba(255, 255, 255, 0.96);
  color: #303133;
  border-bottom-left-radius: 4px;
  box-shadow: 0 8px 20px rgba(34, 44, 88, 0.06);
  border: 1px solid #edf0f7;
}

.message-content {
  white-space: pre-wrap;
}

.message-content :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-content :deep(li) {
  margin: 4px 0;
}

.message-content :deep(.inline-code) {
  background: #f0f2ff;
  color: #667eea;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}

/* 消息操作按钮 */
.message-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble-wrapper:hover .message-actions {
  opacity: 1;
}

.action-icon {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.action-icon:hover {
  background: #f0f2ff;
  color: #667eea;
}

/* 时间戳 */
.message-time {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 4px;
}

/* 打字机光标 */
.typing-cursor {
  display: inline-block;
  animation: blink 0.8s infinite;
  color: #667eea;
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 思考中动画 */
.message-bubble.thinking {
  padding: 14px 20px;
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  background: #909399;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 输入区域 */
.chat-input-area {
  padding: 14px 16px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid #ebeef5;
  flex-shrink: 0;
}

.input-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.quick-hints {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  animation: fadeIn 0.3s ease;
}

.hint-label {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.hint-tag {
  font-size: 12px;
  color: #667eea;
  background: #f0f2ff;
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.hint-tag:hover {
  background: #667eea;
  color: #fff;
}

.input-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.enter-tip,
.char-count {
  font-size: 12px;
  color: #9aa1af;
}

.char-count.warning {
  color: #e6a23c;
  font-weight: 600;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-container {
  flex: 1;
}

.chat-input {
  width: 100%;
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 18px;
  padding: 12px 16px;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  transition: all 0.2s;
  background: #fbfcff;
}

.chat-input :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.send-btn {
  height: 42px;
  padding: 0 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  flex-shrink: 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 10px 18px rgba(102, 126, 234, 0.2);
}

.send-btn:hover:not(:disabled) {
  opacity: 0.94;
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(102, 126, 234, 0.28);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
}

.send-btn.sending {
  background: linear-gradient(135deg, #909399 0%, #a6a9b2 100%);
  box-shadow: none;
}

.send-icon {
  font-size: 16px;
  transition: transform 0.2s;
}

.send-btn:hover .send-icon {
  transform: translateX(2px);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 滚动条 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

/* 响应式 */
@media (max-width: 768px) {
  .ai-chat-page {
    height: calc(100vh - 56px);
    border-radius: 0;
    margin: -16px;
    max-width: none;
  }

  .chat-header {
    padding: 12px 14px;
  }

  .session-stat {
    display: none;
  }

  .welcome-section {
    padding: 24px 14px 30px;
  }

  .welcome-icon {
    width: 68px;
    height: 68px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .welcome-desc {
    font-size: 13px;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }

  .message-bubble-wrapper {
    max-width: 88%;
  }

  .input-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .input-meta {
    justify-content: space-between;
  }

  .quick-hints {
    display: none;
  }

  .action-btn span,
  .enter-tip {
    display: none;
  }

  .chat-messages {
    padding: 16px 14px;
  }
}
</style>
