import{j as s}from"./jsx-runtime-Cnbe3ryz.js";import{z as r}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{d as m,C as d}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const f={title:"Modals/Dialog Recipes/Session/SessionExpiredModal",component:r,args:{...m,title:"Your session has expired",message:"This demo session is no longer active. Please acknowledge this message to continue.",confirmLabel:"Acknowledge"},parameters:{layout:"fullscreen"}},e={parameters:{docs:{source:{code:`<SessionExpiredModal
  visible={visible}
  onClose={handleClose}
  title="Your session has expired"
  message="This session is no longer active."
  confirmLabel="Acknowledge"
/>`}}},render:a=>s.jsx(d,{children:(l,t)=>s.jsx(r,{...a,visible:l,onClose:t})})};var o,i,n;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<SessionExpiredModal
  visible={visible}
  onClose={handleClose}
  title="Your session has expired"
  message="This session is no longer active."
  confirmLabel="Acknowledge"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <SessionExpiredModal {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>
}`,...(n=(i=e.parameters)==null?void 0:i.docs)==null?void 0:n.source}}};const h=["Default"];export{e as Default,h as __namedExportsOrder,f as default};
