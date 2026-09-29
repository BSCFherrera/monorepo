import{j as r}from"./jsx-runtime-Cnbe3ryz.js";import{o as i}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{s as l,d as p,C as d}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const D={title:"Modals/Dialog Recipes/Error/OnboardingErrorUserWithoutData",component:i,args:{...p,title:"Your demo profile needs more information",message:l,confirmLabel:"Return home"},tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility copy variant of ErrorUserWithoutData, including bold/link text inside the information panel."}}}},o={parameters:{docs:{source:{code:`<ErrorUserWithoutData
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="Your demo profile needs more information"
  message={supportMessage}
  confirmLabel="Return home"
/>`}}},render:t=>r.jsx(d,{children:(m,e)=>r.jsx(i,{...t,visible:m,onClose:e,onConfirm:e})})};var s,n,a;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ErrorUserWithoutData
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="Your demo profile needs more information"
  message={supportMessage}
  confirmLabel="Return home"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorUserWithoutData {...args} visible={visible} onClose={onClose} onConfirm={onClose} />}</CommonDialogExample>
}`,...(a=(n=o.parameters)==null?void 0:n.docs)==null?void 0:a.source}}};const E=["Default"];export{o as Default,E as __namedExportsOrder,D as default};
