import React from 'react'
import CreateProfileForm from '../components/CreateProfileForm/CreateProfileForm.tsx'
import PageContainer from '../components/PageContainer/PageContainer.tsx'
import ModernCard from '../components/ModernCard/ModernCard.tsx'

const CreateProfile = () => {
  return (
    <PageContainer 
      title="Welcome to Possilives"
      subtitle="Let's set up your profile to get started on your journey"
      background="gradient"
      centerContent={true}
      maxWidth="md"
    >
      <ModernCard variant="glass" className="w-full">
        <CreateProfileForm />
      </ModernCard>
    </PageContainer>
  )
}

export default CreateProfile
