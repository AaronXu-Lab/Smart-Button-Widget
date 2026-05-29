// code.tsx

const { widget } = figma
const {
  useEffect,
  useSyncedState,
  AutoLayout,
  Input,
  Text,
  SVG
} = widget

function MyWidget() {
  const [code, setCode] = useSyncedState<string>('code', 'figma.notify("Hello world.")')
  const [name, setName] = useSyncedState('scriptName', '')

  const INPUT_TEXT_PLACEHOLDER = "#959593"
  const INPUT_TEXT_ACTIVE = "#131319"

  // 计算行数
  const lineCount = code ? code.split(/\r?\n/).length : 0
  const lineText = lineCount === 1 ? 'line' : 'lines' // 判断单复数

  // 显示 iFrame
  function openEditor() {
    return new Promise<void>((resolve) => {
      figma.showUI(__html__, {
        width: 500,
        height: 600,
      })
      // 传递现有的代码到 iFrame，用于恢复上次编辑状态
      figma.ui.postMessage({ 
        type: 'resume', 
        payload: code,
        scriptName: name
       })
    })
  }

  // 监听 iFrame 中的消息
  useEffect(() => {
    figma.ui.onmessage = (msg) => {
      if (msg.type === 'save') {
        setCode(msg.payload)
        // figma.notify('代码已保存!')
      } else if (msg.type === 'run') {
        runCode(msg.payload)
      } else if (msg.type === 'saveName') {
        setName(msg.payload)
      }
    }
  })

  // 运行用户脚本
  function runCode(script: string) {
    try {
      // eslint-disable-next-line no-eval
      eval(script)
    } catch (e) {
      figma.notify(`Error: ${(e as Error).message}`)
    }
  }

  // “Run” 按钮点击事件
  function handleRunClick() {
    if (!code) {
      figma.notify('No code to run. Please click Edit to add code.')
      return
    }
    runCode(code)
  }

  // 外层容器样式
  const containerStyle = {
    width: 200,
    padding: 4,
    direction: "vertical" as const,
    horizontalAlignItems: "start" as const,
    spacing: 4,
    cornerRadius: 6,
    fill: "#FFF",
    effect: {
      type: "drop-shadow" as const,
      color: { r: 51 / 255, g: 44 / 255, b: 96 / 255, a: 0.08 },
      offset: { x: 0, y: 0 },
      blur: 16,
      spread: 0,
    },
  }

  // 输入框外层包装容器
  const inputWrapperStyle = {
    width: "fill-parent" as const,
    padding: 8,
  }

  // 输入框自身样式
  const inputStyle = {
    width: "fill-parent" as const,
    fontSize: 16,
    fontHeight: 20,
    fontWeight: 600 as const,
    fill: INPUT_TEXT_ACTIVE,
    height: 20,
    placeholder: "Unnamed script",
    placeholderProps: {
      fill: INPUT_TEXT_PLACEHOLDER,
      fontWeight: 500 as const,
      opacity: 1
    },
    value: name,
    inputBehavior: "truncate" as const,
    onTextEditEnd: (e: { characters: string }) => setName(e.characters),
  }

  // 操作栏（包含行数提示和按钮区域）
  const operationRowStyle = {
    width: "fill-parent" as const,
    height: 28,
    direction: "horizontal" as const,
    verticalAlignItems: "center" as const,
    spacing: 'auto' as const, // 左右两端拉开
    padding: { top: 0, bottom: 0, left: 8, right: 0 } as const,
  }

  // 行数提示文本
  const lineInfoTextStyle = {
    fill: "#B7B7B7",
    fontSize: 13,
    lineHeight: 16,
  }

  // “Edit” 按钮容器
  const editButtonStyle = {
    height: 28,
    width: 28,
    // stroke: "#EAEAEA",
    // strokeWidth: 1.5,
    cornerRadius: 3,
    verticalAlignItems: "center" as const,
    horizontalAlignItems: "center" as const,
    hoverStyle: {
      fill: "#EAEAEA",
    }
  }

  // “Run” 按钮容器
  const runButtonStyle = {
    fill: "#7760EB",
    cornerRadius: 3,
    height: 28,
    minWidth: 64,
    verticalAlignItems: "center" as const,
    horizontalAlignItems: "center" as const,
  }

  // “Run” 按钮文字
  const runButtonTextStyle = {
    fill: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: 600 as const,
  }

  // “Edit” 按钮图标
  const editIcon = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.7472 5.10133C11.9815 4.86702 11.9815 4.48712 11.7472 4.25281C11.5129 4.01849 11.133 4.01849 10.8987 4.25281L8.26517 6.8863C8.03086 7.12062 8.03086 7.50052 8.26517 7.73483C8.49949 7.96915 8.87938 7.96915 9.1137 7.73483L11.7472 5.10133Z" fill="#262626"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.5331 2.46688C12.3615 1.2953 10.4621 1.2953 9.29048 2.46688L3.15044 8.60692C2.98214 8.77522 2.87297 8.99356 2.83931 9.22917L2.39148 12.364C2.28777 13.09 2.91002 13.7122 3.63598 13.6085L6.77082 13.1607C7.00644 13.127 7.22478 13.0179 7.39308 12.8496L13.5331 6.70952C14.7047 5.53794 14.7047 3.63845 13.5331 2.46688ZM10.139 3.3154C10.842 2.61246 11.9817 2.61246 12.6846 3.3154C13.3875 4.01835 13.3875 5.15804 12.6846 5.86099L6.56812 11.9775L3.59827 12.4017L4.02254 9.43188L10.139 3.3154Z" fill="#262626"/>
</svg>
`

  // ==============================
  // 组件渲染
  // ==============================
  return (
    <AutoLayout {...containerStyle}>
      {/* 脚本名输入框 */}
      <AutoLayout {...inputWrapperStyle}>
        <Input {...inputStyle} />
      </AutoLayout>

      {/* 操作栏（行数 + 按钮组） */}
      <AutoLayout {...operationRowStyle}>
        <Text {...lineInfoTextStyle}>
          {lineCount} {lineText}
        </Text>

        <AutoLayout spacing={4}>
          <AutoLayout
            {...editButtonStyle}
            onClick={openEditor}
          >
            <SVG src={editIcon} />
          </AutoLayout>

          <AutoLayout
            {...runButtonStyle}
            onClick={handleRunClick}
          >
            <Text {...runButtonTextStyle}>
              Run
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(MyWidget)