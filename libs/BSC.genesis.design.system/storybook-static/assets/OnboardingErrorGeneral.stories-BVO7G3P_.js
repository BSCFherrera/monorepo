import{j as r}from"./jsx-runtime-Cnbe3ryz.js";import{E as t}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{s as m,d as p,C as d}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const E={title:"Modals/Dialog Recipes/Error/OnboardingErrorGeneral",component:t,args:{...p,title:"This demo request needs attention",message:m,confirmLabel:"Return home"},tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility copy variant of ErrorGeneral with the same illustration, heading, rich information panel, spacing, and standard button. Only host callbacks and copy differ."}}}},e={parameters:{docs:{source:{code:`<ErrorGeneral
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="This demo request needs attention"
  message={supportMessage}
  confirmLabel="Return home"
/>`}}},render:i=>r.jsx(d,{children:(l,o)=>r.jsx(t,{...i,visible:l,onClose:o,onConfirm:o})})};var s,n,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ErrorGeneral
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="This demo request needs attention"
  message={supportMessage}
  confirmLabel="Return home"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorGeneral {...args} visible={visible} onClose={onClose} onConfirm={onClose} />}</CommonDialogExample>
}`,...(a=(n=e.parameters)==null?void 0:n.docs)==null?void 0:a.source}}};const x=["Default"];export{e as Default,x as __namedExportsOrder,E as default};
