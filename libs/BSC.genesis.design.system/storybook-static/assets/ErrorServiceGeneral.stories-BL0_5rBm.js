import{j as r}from"./jsx-runtime-Cnbe3ryz.js";import{m as s}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{d as m,C as c}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const E={title:"Modals/Dialog Recipes/Error/ErrorServiceGeneral",component:s,args:{...m,title:"Service temporarily unavailable",message:"The demo service could not complete your request. Please try again later.",confirmLabel:"Close"},parameters:{layout:"fullscreen"}},e={parameters:{docs:{source:{code:`<ErrorServiceGeneral
  visible={visible}
  onClose={handleClose}
  title="Service temporarily unavailable"
  message="The service could not complete your request. Please try again later."
  confirmLabel="Close"
/>`}}},render:i=>r.jsx(c,{children:(n,t)=>r.jsx(s,{...i,visible:n,onClose:t})})};var o,a,l;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ErrorServiceGeneral
  visible={visible}
  onClose={handleClose}
  title="Service temporarily unavailable"
  message="The service could not complete your request. Please try again later."
  confirmLabel="Close"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorServiceGeneral {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>
}`,...(l=(a=e.parameters)==null?void 0:a.docs)==null?void 0:l.source}}};const f=["Default"];export{e as Default,f as __namedExportsOrder,E as default};
