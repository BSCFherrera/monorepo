import{j as s}from"./jsx-runtime-Cnbe3ryz.js";import{J as r}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{d as n,C as i}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const b={title:"Modals/Dialog Recipes/Success/SuccessModal",component:r,args:{...n,title:"Request completed",message:"Your demo request was completed successfully. You can now continue."},parameters:{layout:"fullscreen"}},e={parameters:{docs:{source:{code:`<SuccessModal
  visible={visible}
  onClose={handleClose}
  title="Request completed"
  message="Your request was completed successfully."
/>`}}},render:t=>s.jsx(i,{children:(c,m)=>s.jsx(r,{...t,visible:c,onClose:m})})};var o,l,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<SuccessModal
  visible={visible}
  onClose={handleClose}
  title="Request completed"
  message="Your request was completed successfully."
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <SuccessModal {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>
}`,...(a=(l=e.parameters)==null?void 0:l.docs)==null?void 0:a.source}}};const v=["Default"];export{e as Default,v as __namedExportsOrder,b as default};
