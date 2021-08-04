export const data = {
  "key": "v-15554e84",
  "path": "/test/",
  "title": "test/index",
  "lang": "zh-CN",
  "frontmatter": {},
  "excerpt": "",
  "headers": [],
  "filePathRelative": "test/README.md",
  "git": {
    "updatedTime": 1628058395000,
    "contributors": [
      {
        "name": "ludd",
        "email": "ludd0312@aliyun.com",
        "commits": 1
      }
    ]
  }
}

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
