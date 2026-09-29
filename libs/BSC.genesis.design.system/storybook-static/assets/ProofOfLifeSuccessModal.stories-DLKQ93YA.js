import{j as o}from"./jsx-runtime-Cnbe3ryz.js";import{x as t}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{C as l}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const g={title:"Modals/Dialog Recipes/Success/ProofOfLifeSuccessModal",component:t,tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility success recipe sharing the SuccessModal layout. This example does not perform identity verification."}}},args:{visible:!0,onContinue:()=>{},title:"Demo verification completed",message:"The example verification step is complete. You can continue with the remaining steps.",confirmLabel:"Continue"}},e={parameters:{docs:{source:{code:`<ProofOfLifeSuccessModal
  visible={visible}
  onContinue={handleContinue}
  title="Demo verification completed"
  message="The example verification step is complete."
  confirmLabel="Continue"
/>`}}},render:a=>o.jsx(l,{children:(r,c)=>o.jsx(t,{...a,visible:r,onContinue:c})})};var i,s,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ProofOfLifeSuccessModal
  visible={visible}
  onContinue={handleContinue}
  title="Demo verification completed"
  message="The example verification step is complete."
  confirmLabel="Continue"
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ProofOfLifeSuccessModal {...args} visible={visible} onContinue={onClose} />}</CommonDialogExample>
}`,...(n=(s=e.parameters)==null?void 0:s.docs)==null?void 0:n.source}}};const x=["Default"];export{e as Default,x as __namedExportsOrder,g as default};
