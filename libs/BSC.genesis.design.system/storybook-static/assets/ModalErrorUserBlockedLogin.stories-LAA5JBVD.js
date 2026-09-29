import{j as o}from"./jsx-runtime-Cnbe3ryz.js";import{u as i,a as r}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{C as m}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const f={title:"Modals/Dialog Recipes/Error/ModalErrorUserBlockedLogin",component:i,tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility onboarding error recipe that delegates to the shared ModalCommon information-panel layout."}}},args:{visible:!0,onClose:()=>{},title:"Your demo access is temporarily blocked",confirmLabel:"Acknowledge",message:o.jsxs(r,{children:["Please review the ",o.jsx(r,{style:{fontWeight:"700",color:"#1A1A1A"},children:"demo support instructions"})," before attempting to access the workspace again."]})}},e={parameters:{docs:{source:{code:`<ModalErrorUserBlockedLogin
  visible={visible}
  onClose={handleClose}
  title="Your demo access is temporarily blocked"
  message={blockedAccessMessage}
  confirmLabel="Acknowledge"
/>`}}},render:t=>o.jsx(m,{children:(n,c)=>o.jsx(i,{...t,visible:n,onClose:c})})};var s,a,l;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ModalErrorUserBlockedLogin
  visible={visible}
  onClose={handleClose}
  title="Your demo access is temporarily blocked"
  message={blockedAccessMessage}
  confirmLabel="Acknowledge"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ModalErrorUserBlockedLogin {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>
}`,...(l=(a=e.parameters)==null?void 0:a.docs)==null?void 0:l.source}}};const x=["Default"];export{e as Default,x as __namedExportsOrder,f as default};
