import{j as t}from"./jsx-runtime-Cnbe3ryz.js";import{r as v}from"./index-3dRrDZpt.js";import{h as a,b as r,a as x}from"./index-Ct6YQRae.js";import{V as C}from"./index-DoLDgx4O.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const P={title:"Modals/Compatibility/ContentModal",component:a,args:{visible:!1,onDismiss:()=>{}},tags:["compatibility"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility adapter for terms/disclaimer-style content. Prefer TermsAndConditionsModal or DisclaimerModal for named recipes. Use controlled `visible` when host state owns acceptance; use the imperative `ref` for local preview/demo triggers."}}}};function w(){const[n,e]=v.useState(!1);return t.jsxs(C,{style:{gap:16},children:[t.jsx(r,{label:"Open terms modal",onPress:()=>e(!0)}),t.jsx(a,{visible:n,onDismiss:()=>e(!1),title:"Terms and Conditions",acceptLabel:"Accept",onAccept:()=>e(!1),children:t.jsxs(x,{style:{fontSize:12,lineHeight:20,textAlign:"justify"},children:["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",`

`,"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."]})})]})}const o={parameters:{docs:{source:{code:`const [visible, setVisible] = useState(false);

<>
  <Button label="Open terms modal" onPress={() => setVisible(true)} />
  <ContentModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Terms and Conditions"
    acceptLabel="Accept"
    onAccept={() => setVisible(false)}
  >
    <Text>Terms content supplied by the host.</Text>
  </ContentModal>
</>`}}},render:()=>t.jsx(w,{})},s={parameters:{docs:{source:{code:`const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open content with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close content with ref" onPress={() => modalRef.current?.close()} />
  <ContentModal
    ref={modalRef}
    title="Content preview"
    acceptLabel="Accept"
    onAccept={() => modalRef.current?.close()}
  >
    <Text>Preview content supplied by the host.</Text>
  </ContentModal>
</>`}}},render:()=>{const n=v.useRef(null);return t.jsxs(C,{style:{gap:16},children:[t.jsx(r,{label:"Open content with ref",onPress:()=>{var e;return(e=n.current)==null?void 0:e.open()}}),t.jsx(r,{label:"Close content with ref",onPress:()=>{var e;return(e=n.current)==null?void 0:e.close()}}),t.jsx(a,{ref:n,title:"Content preview",acceptLabel:"Accept",onAccept:()=>{var e;return(e=n.current)==null?void 0:e.close()},children:t.jsx(x,{children:"Use ModalHandle when the content modal is opened by a local trigger and parent state does not need to track visibility."})})]})}},i={args:{visible:!0,variant:"disclaimer",title:"Before you continue",subtitle:"Prepare the following demo items.",requirements:[{label:"A demo profile",iconName:"user"},{label:"A sample document",iconName:"file-text"}],onAccept:()=>{},acceptLabel:"Continue"},parameters:{docs:{source:{code:`<ContentModal
  visible={visible}
  onDismiss={handleDismiss}
  variant="disclaimer"
  title="Before you continue"
  subtitle="Prepare the following items."
  requirements={requirements}
  acceptLabel="Continue"
  onAccept={handleContinue}
/>`}}}};var l,c,d;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`const [visible, setVisible] = useState(false);

<>
  <Button label="Open terms modal" onPress={() => setVisible(true)} />
  <ContentModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Terms and Conditions"
    acceptLabel="Accept"
    onAccept={() => setVisible(false)}
  >
    <Text>Terms content supplied by the host.</Text>
  </ContentModal>
</>\`
      }
    }
  },
  render: () => <TermsExample />
}`,...(d=(c=o.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var m,u,p;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open content with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close content with ref" onPress={() => modalRef.current?.close()} />
  <ContentModal
    ref={modalRef}
    title="Content preview"
    acceptLabel="Accept"
    onAccept={() => modalRef.current?.close()}
  >
    <Text>Preview content supplied by the host.</Text>
  </ContentModal>
</>\`
      }
    }
  },
  render: () => {
    const modalRef = useRef<ModalHandle>(null);
    return <View style={{
      gap: 16
    }}>
        <Button label="Open content with ref" onPress={() => modalRef.current?.open()} />
        <Button label="Close content with ref" onPress={() => modalRef.current?.close()} />
        <ContentModal ref={modalRef} title="Content preview" acceptLabel="Accept" onAccept={() => modalRef.current?.close()}>
          <Text>Use ModalHandle when the content modal is opened by a local trigger and parent state does not need to track visibility.</Text>
        </ContentModal>
      </View>;
  }
}`,...(p=(u=s.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var f,b,h;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    visible: true,
    variant: 'disclaimer',
    title: 'Before you continue',
    subtitle: 'Prepare the following demo items.',
    requirements: [{
      label: 'A demo profile',
      iconName: 'user'
    }, {
      label: 'A sample document',
      iconName: 'file-text'
    }],
    onAccept: () => {},
    acceptLabel: 'Continue'
  },
  parameters: {
    docs: {
      source: {
        code: \`<ContentModal
  visible={visible}
  onDismiss={handleDismiss}
  variant="disclaimer"
  title="Before you continue"
  subtitle="Prepare the following items."
  requirements={requirements}
  acceptLabel="Continue"
  onAccept={handleContinue}
/>\`
      }
    }
  }
}`,...(h=(b=i.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};const D=["Default","ImperativeRef","Disclaimer"];export{o as Default,i as Disclaimer,s as ImperativeRef,D as __namedExportsOrder,P as default};
