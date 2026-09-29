import{j as n}from"./jsx-runtime-Cnbe3ryz.js";import{Y as a}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{d,C as m}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const S={title:"Modals/Dialog Recipes/Session/WarningSessionModal",component:a,args:{...d,title:"Your session will expire soon",message:"This demo session has been inactive. Choose whether to continue or end it now.",confirmLabel:"Continue session",secondaryLabel:"End session",onSecondary:()=>{}},parameters:{layout:"fullscreen"}},e={parameters:{docs:{source:{code:`<WarningSessionModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleEndSession}
  title="Your session will expire soon"
  message="Choose whether to continue or end it now."
  confirmLabel="Continue session"
  secondaryLabel="End session"
/>`}}},render:l=>n.jsx(m,{children:(t,o)=>n.jsx(a,{...l,visible:t,onClose:o,onSecondary:o})})};var s,i,r;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<WarningSessionModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleEndSession}
  title="Your session will expire soon"
  message="Choose whether to continue or end it now."
  confirmLabel="Continue session"
  secondaryLabel="End session"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <WarningSessionModal {...args} visible={visible} onClose={onClose} onSecondary={onClose} />}</CommonDialogExample>
}`,...(r=(i=e.parameters)==null?void 0:i.docs)==null?void 0:r.source}}};const x=["Default"];export{e as Default,x as __namedExportsOrder,S as default};
