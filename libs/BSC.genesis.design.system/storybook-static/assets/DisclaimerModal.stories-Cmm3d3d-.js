import{j as i}from"./jsx-runtime-Cnbe3ryz.js";import{D as l}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{C as m}from"./CommonDialogExample-CoQMMs56.js";import{B as c}from"./BrandPlaceholder-Q8OEJdWw.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const D={title:"Modals/Dialog Recipes/Disclaimer/DisclaimerModal",component:l,args:{visible:!0,onClose:()=>{},onBack:()=>{},onContinue:()=>{},title:"Before you continue",subtitle:"Prepare the following items for this demo.",logo:i.jsx(c,{}),requirements:[{label:"A demo profile",iconName:"user"},{label:"A sample document",iconName:"file-text"},{label:"Time to complete the steps",iconName:"clock"},{label:"Your confirmation",iconName:"check-circle"}]},parameters:{layout:"fullscreen",docs:{description:{component:"Named disclaimer recipe built on the shared ModalCommon surface. Prefer this over the generic ContentModal adapter for disclaimer-specific flows."}}}},e={parameters:{docs:{source:{code:`<DisclaimerModal
  visible={visible}
  onClose={handleClose}
  onBack={handleBack}
  onContinue={handleContinue}
  title="Before you continue"
  subtitle="Prepare the following items for this demo."
  requirements={requirements}
/>`}}},render:s=>i.jsx(m,{children:(t,o)=>i.jsx(l,{...s,visible:t,onClose:o,onBack:o,onContinue:o})})};var n,r,a;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<DisclaimerModal
  visible={visible}
  onClose={handleClose}
  onBack={handleBack}
  onContinue={handleContinue}
  title="Before you continue"
  subtitle="Prepare the following items for this demo."
  requirements={requirements}
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <DisclaimerModal {...args} visible={visible} onClose={onClose} onBack={onClose} onContinue={onClose} />}</CommonDialogExample>
}`,...(a=(r=e.parameters)==null?void 0:r.docs)==null?void 0:a.source}}};const B=["Default"];export{e as Default,B as __namedExportsOrder,D as default};
