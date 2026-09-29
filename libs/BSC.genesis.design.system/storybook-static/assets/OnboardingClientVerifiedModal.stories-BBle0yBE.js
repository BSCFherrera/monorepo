import{j as r}from"./jsx-runtime-Cnbe3ryz.js";import{r as b}from"./index-3dRrDZpt.js";import{O as f}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import{B as h}from"./BrandPlaceholder-Q8OEJdWw.js";import{C as E}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const u={visible:!0,onClose:()=>{},title:"Unable to complete the demo step",message:"No registration service is connected. Return to the profile and try this example again.",confirmLabel:"Return to profile"},D={title:"Modals/Dialog Recipes/Client Verification/OnboardingClientVerifiedModal",component:f,tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility client-verification recipe matching ClientVerifiedModal. The optional service-error state uses ErrorServiceGeneral without invoking a backend."}}},args:{visible:!0,onClose:()=>{},title:"Confirm your information",message:"Review the demo profile before continuing to the next step.",details:[{label:"Display name",value:"Example Participant"}],logo:r.jsx(h,{}),secondaryLabel:"This is not me",onSecondary:()=>{},confirmLabel:"Continue"}};function g(e){var t;const[C,n]=b.useState(((t=e.serviceError)==null?void 0:t.visible)??!1);return r.jsx(E,{children:(v,a)=>r.jsx(f,{...e,visible:v,onClose:a,onSecondary:a,onConfirm:()=>n(!0),serviceError:{...u,visible:C,onClose:()=>n(!1)}})})}const o={parameters:{docs:{source:{code:`<OnboardingClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleContinue}
  onSecondary={handleReject}
  title="Confirm your information"
  message="Review the demo profile before continuing to the next step."
  details={[{ label: 'Display name', value: 'Example Participant' }]}
  logo={<BrandLogo />}
/>`}}},render:e=>r.jsx(g,{...e})},i={args:{serviceError:u},parameters:{docs:{source:{code:`<OnboardingClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleContinue}
  title="Confirm your information"
  serviceError={{
    visible: showServiceError,
    onClose: hideServiceError,
    title: 'Unable to complete the step',
    message: 'Please return to the profile and try again.',
  }}
/>`}}},render:e=>r.jsx(g,{...e})};var s,l,c;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<OnboardingClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleContinue}
  onSecondary={handleReject}
  title="Confirm your information"
  message="Review the demo profile before continuing to the next step."
  details={[{ label: 'Display name', value: 'Example Participant' }]}
  logo={<BrandLogo />}
/>\`
      }
    }
  },
  render: args => <Example {...args} />
}`,...(c=(l=o.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var d,m,p;i.parameters={...i.parameters,docs:{...(d=i.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    serviceError
  },
  parameters: {
    docs: {
      source: {
        code: \`<OnboardingClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onConfirm={handleContinue}
  title="Confirm your information"
  serviceError={{
    visible: showServiceError,
    onClose: hideServiceError,
    title: 'Unable to complete the step',
    message: 'Please return to the profile and try again.',
  }}
/>\`
      }
    }
  },
  render: args => <Example {...args} />
}`,...(p=(m=i.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};const w=["Default","ServiceError"];export{o as Default,i as ServiceError,w as __namedExportsOrder,D as default};
