import{j as s}from"./jsx-runtime-Cnbe3ryz.js";import{r as de}from"./index-3dRrDZpt.js";import{F as k,b as x}from"./index-Ct6YQRae.js";import{V as le}from"./index-DoLDgx4O.js";import{B as pe}from"./BrandPlaceholder-Q8OEJdWw.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const ke={title:"Feedback/FeedbackModal",component:k,args:{visible:!1,onDismiss:()=>{},title:"Example feedback"},parameters:{layout:"fullscreen",docs:{description:{component:"FeedbackModal adapts shared dialog recipes behind one variant prop. Use controlled `visible` when feedback follows app state. Use the imperative `ref` for local, one-off feedback triggers. Specialized recipe exports remain available for compatibility and clearer migration paths."}}}};function o({variant:e,initiallyOpen:a=!1}){const[me,i]=de.useState(a);return s.jsxs(le,{style:{gap:16},children:[s.jsx(x,{label:`Open ${e}`,onPress:()=>i(!0)}),s.jsx(k,{visible:me,onDismiss:()=>i(!1),title:e==="success"?"Process completed":e==="timeout"?"Session timeout":e==="sessionExpired"?"Session expired":e==="sessionWarning"?"Session about to expire":e==="blockedLogin"?"Account locked":e==="welcome"?"Welcome!":e==="clientVerified"?"Verify your data":e==="maxAttempts"?"Maximum attempts reached":e==="unvalidatedClient"?"Unvalidated client":"Information",variant:e,message:e==="success"?"Your demo request has been processed successfully.":e==="timeout"?"The demo request took too long to complete.":e==="sessionExpired"?"Your previous demo session is no longer valid.":e==="sessionWarning"?"Your demo session will expire soon due to inactivity.":e==="blockedLogin"?"Please review the demo support instructions before trying again.":e==="welcome"?"Explore your new conversation space and discover the available tools at your own pace.":e==="maxAttempts"?"Review the demo help resources to learn about the next step.":e==="unvalidatedClient"?"Your demo profile has not been validated yet.":e==="clientVerified"?"Example Participant":"This is a synthetic informational message.",warningMessage:e==="maxAttempts"?"You have exceeded the maximum number of attempts.":void 0,subtitle:e==="clientVerified"?"Please confirm your information below.":void 0,canDismiss:e!=="sessionExpired"&&e!=="sessionWarning",confirmLabel:e==="sessionWarning"?"Extend session":e==="welcome"?"Get started":"Continue",onConfirm:()=>i(!1),secondaryLabel:e==="sessionWarning"?"Log out":e==="clientVerified"?"This is not me":e==="unvalidatedClient"?"Go home":void 0,onSecondary:e==="sessionWarning"||e==="clientVerified"||e==="unvalidatedClient"?()=>i(!1):void 0,logo:e==="clientVerified"?s.jsx(pe,{}):void 0,detailLabel:e==="clientVerified"?"Display name":void 0})]})}const r={parameters:{docs:{source:{code:`<FeedbackModal
  visible={visible}
  onDismiss={handleDismiss}
  variant="info"
  title="Information"
  message="This is a synthetic informational message."
  confirmLabel="Continue"
  onConfirm={handleDismiss}
/>`}}},render:()=>s.jsx(o,{variant:"info"})},t={parameters:{docs:{source:{code:`const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open feedback with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close feedback with ref" onPress={() => modalRef.current?.close()} />
  <FeedbackModal
    ref={modalRef}
    variant="success"
    title="Saved"
    message="This feedback modal was opened through ModalHandle.open()."
    confirmLabel="Close"
    onConfirm={() => modalRef.current?.close()}
  />
</>`}}},render:()=>{const e=de.useRef(null);return s.jsxs(le,{style:{gap:16},children:[s.jsx(x,{label:"Open feedback with ref",onPress:()=>{var a;return(a=e.current)==null?void 0:a.open()}}),s.jsx(x,{label:"Close feedback with ref",onPress:()=>{var a;return(a=e.current)==null?void 0:a.close()}}),s.jsx(k,{ref:e,variant:"success",title:"Saved",message:"This feedback modal was opened through ModalHandle.open().",confirmLabel:"Close",onConfirm:()=>{var a;return(a=e.current)==null?void 0:a.close()}})]})}},n={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="service" title="Information" message="The service could not complete the request." />'}}},render:()=>s.jsx(o,{variant:"service"})},c={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="contact" title="Information" message="Contact support for help with this request." />'}}},render:()=>s.jsx(o,{variant:"contact"})},d={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="userData" title="Information" message="Review the information associated with this profile." />'}}},render:()=>s.jsx(o,{variant:"userData"})},l={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="success" title="Process completed" message="Your request has been processed successfully." />'}}},render:()=>s.jsx(o,{variant:"success",initiallyOpen:!0})},m={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="timeout" title="Session timeout" message="The request took too long to complete." />'}}},render:()=>s.jsx(o,{variant:"timeout"})},p={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="sessionExpired" title="Session expired" message="Your previous session is no longer valid." />'}}},render:()=>s.jsx(o,{variant:"sessionExpired"})},u={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="sessionWarning" title="Session about to expire" message="Your session will expire soon." secondaryLabel="Log out" onSecondary={handleLogout} />'}}},render:()=>s.jsx(o,{variant:"sessionWarning"})},b={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="blockedLogin" title="Account locked" message="Please review the support instructions before trying again." />'}}},render:()=>s.jsx(o,{variant:"blockedLogin"})},f={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="welcome" title="Welcome!" message="Explore your new conversation space." confirmLabel="Get started" />'}}},render:()=>s.jsx(o,{variant:"welcome"})},v={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="maxAttempts" title="Maximum attempts reached" warningMessage="You have exceeded the maximum number of attempts." />'}}},render:()=>s.jsx(o,{variant:"maxAttempts"})},h={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="unvalidatedClient" title="Unvalidated client" message="Your profile has not been validated yet." secondaryLabel="Go home" onSecondary={handleGoHome} />'}}},render:()=>s.jsx(o,{variant:"unvalidatedClient"})},g={parameters:{docs:{source:{code:'<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="clientVerified" title="Verify your data" message="Example Participant" logo={<BrandLogo />} />'}}},render:()=>s.jsx(o,{variant:"clientVerified"})};var D,F,M;r.parameters={...r.parameters,docs:{...(D=r.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<FeedbackModal
  visible={visible}
  onDismiss={handleDismiss}
  variant="info"
  title="Information"
  message="This is a synthetic informational message."
  confirmLabel="Continue"
  onConfirm={handleDismiss}
/>\`
      }
    }
  },
  render: () => <FeedbackExample variant="info" />
}`,...(M=(F=r.parameters)==null?void 0:F.docs)==null?void 0:M.source}}};var w,y,S;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open feedback with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close feedback with ref" onPress={() => modalRef.current?.close()} />
  <FeedbackModal
    ref={modalRef}
    variant="success"
    title="Saved"
    message="This feedback modal was opened through ModalHandle.open()."
    confirmLabel="Close"
    onConfirm={() => modalRef.current?.close()}
  />
</>\`
      }
    }
  },
  render: () => {
    const modalRef = useRef<ModalHandle>(null);
    return <View style={{
      gap: 16
    }}>
        <Button label="Open feedback with ref" onPress={() => modalRef.current?.open()} />
        <Button label="Close feedback with ref" onPress={() => modalRef.current?.close()} />
        <FeedbackModal ref={modalRef} variant="success" title="Saved" message="This feedback modal was opened through ModalHandle.open()." confirmLabel="Close" onConfirm={() => modalRef.current?.close()} />
      </View>;
  }
}`,...(S=(y=t.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var C,E,L;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="service" title="Information" message="The service could not complete the request." />'
      }
    }
  },
  render: () => <FeedbackExample variant="service" />
}`,...(L=(E=n.parameters)==null?void 0:E.docs)==null?void 0:L.source}}};var R,j,V;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="contact" title="Information" message="Contact support for help with this request." />'
      }
    }
  },
  render: () => <FeedbackExample variant="contact" />
}`,...(V=(j=c.parameters)==null?void 0:j.docs)==null?void 0:V.source}}};var P,W,T;d.parameters={...d.parameters,docs:{...(P=d.parameters)==null?void 0:P.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="userData" title="Information" message="Review the information associated with this profile." />'
      }
    }
  },
  render: () => <FeedbackExample variant="userData" />
}`,...(T=(W=d.parameters)==null?void 0:W.docs)==null?void 0:T.source}}};var Y,B,I;l.parameters={...l.parameters,docs:{...(Y=l.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="success" title="Process completed" message="Your request has been processed successfully." />'
      }
    }
  },
  render: () => <FeedbackExample variant="success" initiallyOpen />
}`,...(I=(B=l.parameters)==null?void 0:B.docs)==null?void 0:I.source}}};var A,q,H;m.parameters={...m.parameters,docs:{...(A=m.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="timeout" title="Session timeout" message="The request took too long to complete." />'
      }
    }
  },
  render: () => <FeedbackExample variant="timeout" />
}`,...(H=(q=m.parameters)==null?void 0:q.docs)==null?void 0:H.source}}};var U,G,O;p.parameters={...p.parameters,docs:{...(U=p.parameters)==null?void 0:U.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="sessionExpired" title="Session expired" message="Your previous session is no longer valid." />'
      }
    }
  },
  render: () => <FeedbackExample variant="sessionExpired" />
}`,...(O=(G=p.parameters)==null?void 0:G.docs)==null?void 0:O.source}}};var _,z,$;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="sessionWarning" title="Session about to expire" message="Your session will expire soon." secondaryLabel="Log out" onSecondary={handleLogout} />'
      }
    }
  },
  render: () => <FeedbackExample variant="sessionWarning" />
}`,...($=(z=u.parameters)==null?void 0:z.docs)==null?void 0:$.source}}};var J,K,N;b.parameters={...b.parameters,docs:{...(J=b.parameters)==null?void 0:J.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="blockedLogin" title="Account locked" message="Please review the support instructions before trying again." />'
      }
    }
  },
  render: () => <FeedbackExample variant="blockedLogin" />
}`,...(N=(K=b.parameters)==null?void 0:K.docs)==null?void 0:N.source}}};var Q,X,Z;f.parameters={...f.parameters,docs:{...(Q=f.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="welcome" title="Welcome!" message="Explore your new conversation space." confirmLabel="Get started" />'
      }
    }
  },
  render: () => <FeedbackExample variant="welcome" />
}`,...(Z=(X=f.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};var ee,se,oe;v.parameters={...v.parameters,docs:{...(ee=v.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="maxAttempts" title="Maximum attempts reached" warningMessage="You have exceeded the maximum number of attempts." />'
      }
    }
  },
  render: () => <FeedbackExample variant="maxAttempts" />
}`,...(oe=(se=v.parameters)==null?void 0:se.docs)==null?void 0:oe.source}}};var ae,ie,re;h.parameters={...h.parameters,docs:{...(ae=h.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="unvalidatedClient" title="Unvalidated client" message="Your profile has not been validated yet." secondaryLabel="Go home" onSecondary={handleGoHome} />'
      }
    }
  },
  render: () => <FeedbackExample variant="unvalidatedClient" />
}`,...(re=(ie=h.parameters)==null?void 0:ie.docs)==null?void 0:re.source}}};var te,ne,ce;g.parameters={...g.parameters,docs:{...(te=g.parameters)==null?void 0:te.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: '<FeedbackModal visible={visible} onDismiss={handleDismiss} variant="clientVerified" title="Verify your data" message="Example Participant" logo={<BrandLogo />} />'
      }
    }
  },
  render: () => <FeedbackExample variant="clientVerified" />
}`,...(ce=(ne=g.parameters)==null?void 0:ne.docs)==null?void 0:ce.source}}};const De=["Info","ImperativeRef","Service","Contact","UserData","Success","Timeout","SessionExpired","SessionWarning","BlockedLogin","Welcome","MaxAttempts","UnvalidatedClient","ClientVerified"];export{b as BlockedLogin,g as ClientVerified,c as Contact,t as ImperativeRef,r as Info,v as MaxAttempts,n as Service,p as SessionExpired,u as SessionWarning,l as Success,m as Timeout,h as UnvalidatedClient,d as UserData,f as Welcome,De as __namedExportsOrder,ke as default};
