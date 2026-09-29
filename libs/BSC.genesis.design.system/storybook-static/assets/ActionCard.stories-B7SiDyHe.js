import{j as R}from"./jsx-runtime-Cnbe3ryz.js";import{A as v,R as f,T as w}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const j={title:"Cards/ActionCard",component:v,args:{title:"Explore details",subtitle:"Tap to view more information"},parameters:{docs:{description:{component:"Action card stories include the compatibility card wrappers as variants so the catalog is grouped by purpose."}}}},e={args:{onPress:()=>{}}},r={args:{variant:"registration",title:"First time here?",subtitle:"Create your account",iconName:"user-plus",onPress:()=>{}}},t={args:{disabled:!0,onPress:()=>{}}},a={name:"TouchableCard compatibility variant",args:{onPress:()=>{}},parameters:{docs:{description:{story:"Compatibility wrapper kept under ActionCard because it serves the same selectable-card purpose."},source:{code:`<TouchableCard
  title="Review your preferences"
  subtitle="Choose the details you want to update."
  iconName="user"
  onPress={handlePress}
/>`}}},render:()=>R.jsx(w,{title:"Review your preferences",subtitle:"Choose the details you want to update.",iconName:"user",onPress:()=>{}})},s={name:"RegisterPromptCard compatibility variant",args:{onPress:()=>{}},parameters:{docs:{description:{story:"Compatibility wrapper kept under ActionCard because it is a registration-flavored action card."},source:{code:`<RegisterPromptCard
  title="First time here?"
  subtitle="Create a demo profile to continue."
  onPress={handleRegister}
/>`}}},render:()=>R.jsx(f,{title:"First time here?",subtitle:"Create a demo profile to continue.",onPress:()=>{}})};var o,i,n;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    onPress: () => {}
  }
}`,...(n=(i=e.parameters)==null?void 0:i.docs)==null?void 0:n.source}}};var c,d,p;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    variant: 'registration',
    title: 'First time here?',
    subtitle: 'Create your account',
    iconName: 'user-plus',
    onPress: () => {}
  }
}`,...(p=(d=r.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var u,m,l;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    disabled: true,
    onPress: () => {}
  }
}`,...(l=(m=t.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};var b,C,g;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'TouchableCard compatibility variant',
  args: {
    onPress: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Compatibility wrapper kept under ActionCard because it serves the same selectable-card purpose.'
      },
      source: {
        code: \`<TouchableCard
  title="Review your preferences"
  subtitle="Choose the details you want to update."
  iconName="user"
  onPress={handlePress}
/>\`
      }
    }
  },
  render: () => <TouchableCard title="Review your preferences" subtitle="Choose the details you want to update." iconName="user" onPress={() => {}} />
}`,...(g=(C=a.parameters)==null?void 0:C.docs)==null?void 0:g.source}}};var h,P,y;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'RegisterPromptCard compatibility variant',
  args: {
    onPress: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Compatibility wrapper kept under ActionCard because it is a registration-flavored action card.'
      },
      source: {
        code: \`<RegisterPromptCard
  title="First time here?"
  subtitle="Create a demo profile to continue."
  onPress={handleRegister}
/>\`
      }
    }
  },
  render: () => <RegisterPromptCard title="First time here?" subtitle="Create a demo profile to continue." onPress={() => {}} />
}`,...(y=(P=s.parameters)==null?void 0:P.docs)==null?void 0:y.source}}};const k=["Standard","Registration","Disabled","TouchableCardVariant","RegisterPromptCardVariant"];export{t as Disabled,s as RegisterPromptCardVariant,r as Registration,e as Standard,a as TouchableCardVariant,k as __namedExportsOrder,j as default};
