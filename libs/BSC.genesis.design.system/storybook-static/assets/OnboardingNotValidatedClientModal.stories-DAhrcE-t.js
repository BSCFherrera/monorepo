import{j as i}from"./jsx-runtime-Cnbe3ryz.js";import{N as r}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{d as s,C as m}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const g={title:"Modals/Dialog Recipes/Client Verification/OnboardingNotValidatedClientModal",component:r,args:{...s,title:"Your demo profile is not validated",confirmLabel:"Review profile",secondaryLabel:"Return home",onSecondary:()=>{}},tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility copy variant of NotValidatedClientModal: two filled full-width pills below the information panel."}}}},e={parameters:{docs:{source:{code:`<NotValidatedClientModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleReviewProfile}
  onSecondary={handleReturnHome}
  title="Your demo profile is not validated"
  confirmLabel="Review profile"
  secondaryLabel="Return home"
/>`}}},render:t=>i.jsx(m,{children:(d,o)=>i.jsx(r,{...t,visible:d,onClose:o,onConfirm:o,onSecondary:o})})};var n,a,l;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<NotValidatedClientModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleReviewProfile}
  onSecondary={handleReturnHome}
  title="Your demo profile is not validated"
  confirmLabel="Review profile"
  secondaryLabel="Return home"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <NotValidatedClientModal {...args} visible={visible} onClose={onClose} onConfirm={onClose} onSecondary={onClose} />}</CommonDialogExample>
}`,...(l=(a=e.parameters)==null?void 0:a.docs)==null?void 0:l.source}}};const h=["Default"];export{e as Default,h as __namedExportsOrder,g as default};
