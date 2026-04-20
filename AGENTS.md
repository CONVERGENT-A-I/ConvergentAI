<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->



Flow being used now:
CTA flow button clicked -> pop up of compliance appears, press agree and continue -> the video meet as default appears -> can select other channels as well

New Flow:
User clicks CTA flow -> Avatar appears and give introduction saying "Hi! I am here to help you with mortgage related questions, Please select the Live with Ailana if you want to continue conversation with me or select any other channel of your choice" -> the channels are triggered and shown on the screen -> user selects:

1. Video Meet , Avatar Continues the flow
2. Type to AI, channel switches to type to AI
3. SPeak to AI , switch to that
4. Live Chat, switch to that and so on

-> after the user chooses any of the AI related , the compliance popup should appear and the user should only be allowed to continue if they select accept and continue -> user clicks accept and continue -> the channel starts and the conversation happens 



NOTE: YOU CAN TWEAK THE INTRODUCTION AND ADD SOME CHANGES IF YOU THINK THEY ARE BETTER FOR THE FLOW BUT THE GLITCHES OR INTERRUPTIONS LIKE CONNECTING OR OTHER THINGS SHOULD NOT HAPPEN, while introduction is being played the connection to livekit room or other should already be done in the background


STRICT NOTE: MAKE THIS FLOW MORE EFFECIENT 