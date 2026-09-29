import{j as a}from"./jsx-runtime-Cnbe3ryz.js";import{N as t}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{d,C as m}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const y={title:"Modals/Dialog Recipes/Client Verification/NotValidatedClientModal",component:t,args:{...d,title:"Profile not yet validated",secondaryLabel:"Return home",confirmLabel:"Review profile",onSecondary:()=>{}},parameters:{layout:"fullscreen"}},e={parameters:{docs:{source:{code:`<NotValidatedClientModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleReturnHome}
  title="Profile not yet validated"
  confirmLabel="Review profile"
  secondaryLabel="Return home"
/>`}}},render:i=>a.jsx(m,{children:(s,o)=>a.jsx(t,{...i,visible:s,onClose:o,onSecondary:o})})};var n,l,r;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<NotValidatedClientModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleReturnHome}
  title="Profile not yet validated"
  confirmLabel="Review profile"
  secondaryLabel="Return home"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <NotValidatedClientModal {...args} visible={visible} onClose={onClose} onSecondary={onClose} />}</CommonDialogExample>
}`,...(r=(l=e.parameters)==null?void 0:l.docs)==null?void 0:r.source}}};const g=["Default"];export{e as Default,g as __namedExportsOrder,y as default};
