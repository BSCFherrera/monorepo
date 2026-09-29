import{j as o}from"./jsx-runtime-Cnbe3ryz.js";import{Z as r,a}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{C as m}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const v={title:"Modals/Dialog Recipes/Welcome/WelcomeModal",component:r,tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility onboarding recipe that delegates to the shared ModalCommon surface with welcome-specific copy and action wiring."}}},args:{visible:!0,onClose:()=>{},onAccessChat:()=>{},title:"Welcome to your demo workspace",confirmLabel:"Open conversation",message:o.jsxs(a,{children:["You can now explore ",o.jsx(a,{style:{fontWeight:"700",color:"#1A1A1A"},children:"your new conversation space"})," and discover the available tools at your own pace."]})}},e={parameters:{docs:{source:{code:`<WelcomeModal
  visible={visible}
  onClose={handleClose}
  onAccessChat={handleAccessChat}
  title="Welcome to your demo workspace"
  confirmLabel="Open conversation"
  message={welcomeMessage}
/>`}}},render:t=>o.jsx(m,{children:(i,s)=>o.jsx(r,{...t,visible:i,onClose:s,onAccessChat:s})})};var n,c,l;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<WelcomeModal
  visible={visible}
  onClose={handleClose}
  onAccessChat={handleAccessChat}
  title="Welcome to your demo workspace"
  confirmLabel="Open conversation"
  message={welcomeMessage}
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <WelcomeModal {...args} visible={visible} onClose={onClose} onAccessChat={onClose} />}</CommonDialogExample>
}`,...(l=(c=e.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const f=["Default"];export{e as Default,f as __namedExportsOrder,v as default};
