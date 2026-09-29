import{j as r}from"./jsx-runtime-Cnbe3ryz.js";import{m as i}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{d as m,C as c}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const f={title:"Modals/Dialog Recipes/Error/OnboardingErrorServiceGeneral",component:i,args:{...m,title:"The demo service is unavailable",message:"This example service cannot complete your request. Please try again later.",confirmLabel:"Close"},tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility copy variant of ErrorServiceGeneral: the same information-panel recipe with a standard close action."}}}},e={parameters:{docs:{source:{code:`<ErrorServiceGeneral
  visible={visible}
  onClose={handleClose}
  title="The demo service is unavailable"
  message="This example service cannot complete your request. Please try again later."
  confirmLabel="Close"
/>`}}},render:l=>r.jsx(c,{children:(n,t)=>r.jsx(i,{...l,visible:n,onClose:t})})};var o,a,s;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ErrorServiceGeneral
  visible={visible}
  onClose={handleClose}
  title="The demo service is unavailable"
  message="This example service cannot complete your request. Please try again later."
  confirmLabel="Close"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ErrorServiceGeneral {...args} visible={visible} onClose={onClose} />}</CommonDialogExample>
}`,...(s=(a=e.parameters)==null?void 0:a.docs)==null?void 0:s.source}}};const x=["Default"];export{e as Default,x as __namedExportsOrder,f as default};
