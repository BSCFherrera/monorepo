import{j as o}from"./jsx-runtime-Cnbe3ryz.js";import{M as m}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{s as l,d,C as p}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const h={title:"Modals/Dialog Recipes/Error/OnboardingMaximumIntentsModal",component:m,args:{...d,title:"Maximum demo attempts reached",warningMessage:"The allowed number of example attempts has been exceeded.",message:l,confirmLabel:"Return home"},tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility copy variant of MaximumIntentsModal. A separate red warning panel precedes the blue information panel."}}}},e={parameters:{docs:{source:{code:`<MaximumIntentsModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="Maximum demo attempts reached"
  warningMessage="The allowed number of example attempts has been exceeded."
  message={supportMessage}
  confirmLabel="Return home"
/>`}}},render:r=>o.jsx(p,{children:(i,a)=>o.jsx(m,{...r,visible:i,onClose:a,onConfirm:a})})};var s,n,t;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<MaximumIntentsModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleClose}
  title="Maximum demo attempts reached"
  warningMessage="The allowed number of example attempts has been exceeded."
  message={supportMessage}
  confirmLabel="Return home"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <MaximumIntentsModal {...args} visible={visible} onClose={onClose} onConfirm={onClose} />}</CommonDialogExample>
}`,...(t=(n=e.parameters)==null?void 0:n.docs)==null?void 0:t.source}}};const C=["Default"];export{e as Default,C as __namedExportsOrder,h as default};
