<script lang="ts">
    import { displayShortAddress, displayShorterAddress, fixSafeAddress } from "$lib/factory/eth.factory";
    import { writable, type Writable } from "svelte/store";
    import { contacts, hidden_contacts } from "$lib/store/contacts.store";
    import { createEventDispatcher, onMount } from "svelte";
    import { trustChange, updateContacts, type Contact } from "$lib/factory/contact.factory";
    import { contacts_state } from "$lib/store/state.store";
    import Transfer from "./Transfer.svelte";
    import SpinnerWave from "./SpinnerWave.svelte";
    import { ethers } from "ethers";

    const dispatch = createEventDispatcher();
    const to_address = writable("");
    const activeContact: Writable<Contact|null> = writable(null);


    const handleBack = async () => {
        contacts_state.set("");
    }

  
    const handleInvite = async (friend_adress:string) => {
       dispatch('friend_address_event', friend_adress);
    }

    const handleTransfer = async (to:string) => {
    
        to_address.set(to);
        contacts_state.set("transfer")
    }

    const handleTrustChange = async (contact: Contact) => {

        activeContact.set(contact);

        if (contact.relation === "trustedBy") {
            contacts_state.set("reciprocate")
        } else if (contact.relation === "mutuallyTrusts") {
            contacts_state.set("revoke")
        } else {
            contacts_state.set("trustchoice")
            // await runTrustChange(contact)
        }
    }

    const handleReciprocate = async () => {
        if ($activeContact == null) return;
        await runTrustChange($activeContact)
    }

    const handleRevoke = async () => {
        if ($activeContact == null) return;
        await runTrustChange($activeContact)
    }

    const handleHide = async () => {
        if ($activeContact == null) return;
        contacts_state.set("spinner");
        hidden_contacts?.update((hidden: string) => {

            let parsed;
            try {
                parsed = JSON.parse(hidden);
            } catch (error) {
                parsed = [];
            }
            let h = [...parsed, ethers.getAddress($activeContact.objectAvatar)];
            return JSON.stringify(h)
        })

        await updateContacts();
        contacts_state.set("");

    }

    const runTrustChange = async (contact: Contact) => {
        contacts_state.set("spinner");
        await trustChange(contact)
        activeContact.set(null);
        contacts_state.set("");
    }

    const network: Writable<Contact[]> = writable([])
    const hasAvatar: Writable<boolean> = writable(false)

    // fill from local storage
    if (contacts) {
        contacts.subscribe((contacts) => {
            if (contacts != "") {
                network.set(JSON.parse(contacts))
            }
        })
    }

    onMount( async () => {
        network.set(
            await updateContacts()
        );
    })

</script>

<section class="scrolltainer">

    <article>

        {#if $network.length == 0 || $contacts_state == "spinner"}
            <SpinnerWave></SpinnerWave>

        {:else if $contacts_state == "reciprocate"}
            <label>Do you wish to reciprocate trust {#if $activeContact?.objectName} to {displayShorterAddress($activeContact?.objectName)} {/if}</label>
            <button class="button"on:click={handleReciprocate}>Yes!</button>
            <button class="button"on:click={handleBack}>Nope, that me back</button>

        {:else if $contacts_state == "revoke"}
            <button on:click={handleReciprocate}>Revoke trust from {$activeContact?.objectName}</button>
            <button class="button"on:click={handleRevoke}>Yes!</button>
            <button class="button"on:click={handleBack}>Nope, take me back</button>

        {:else if $contacts_state == "trustchoice"}
            <button on:click={handleReciprocate}>what do you want to do with {displayShortAddress($activeContact?.objectName || "")}?</button>
            <button class="button"on:click={handleReciprocate}>Reciprocate trust</button>
            <button class="button"on:click={handleHide}>Hide from contacts</button>
            <button class="button"on:click={handleBack}>Take me back</button>

        {:else if $contacts_state == "transfer"}
            <Transfer toAddress={$to_address}></Transfer>

        {:else }

            {#each $network as contact}
                <div>
                    
                    <div class="contact-left">
                        <button on:click={() => handleTrustChange(contact)}>
                            {#if contact.relation == "mutuallyTrusts"}
                                <svg class="relation" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="32" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" enable-background="new 0 0 100 100" xml:space="preserve"><polygon fill-rule="evenodd" clip-rule="evenodd" points="0.177,43.555 99.823,43.555 99.822,29.753 33.306,29.753 52.103,10.956   42.322,1.176 0.199,43.299 0.333,43.434 "/><polygon fill-rule="evenodd" clip-rule="evenodd" points="99.823,56.445 0.177,56.445 0.178,70.246 66.694,70.246 47.897,89.043   57.678,98.824 99.801,56.701 99.667,56.566 "/></svg>
                            {:else if contact.relation == "trustedBy"}
                                <svg class="relation" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="32" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" enable-background="new 0 0 100 100" xml:space="preserve"><polygon fill-rule="evenodd" fill="black" clip-rule="evenodd" points="0.177,43.555 99.823,43.555 99.822,29.753 33.306,29.753 52.103,10.956   42.322,1.176 0.199,43.299 0.333,43.434 "/><polygon fill-rule="evenodd" fill="transparent" clip-rule="evenodd" points="99.823,56.445 0.177,56.445 0.178,70.246 66.694,70.246 47.897,89.043   57.678,98.824 99.801,56.701 99.667,56.566 "/></svg>
                            {:else if contact.relation == "trusts"}
                                <svg class="relation" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="32" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" enable-background="new 0 0 100 100" xml:space="preserve"><polygon fill-rule="evenodd" fill="transparent" clip-rule="evenodd" points="0.177,43.555 99.823,43.555 99.822,29.753 33.306,29.753 52.103,10.956   42.322,1.176 0.199,43.299 0.333,43.434 "/><polygon fill-rule="evenodd" fill="black" clip-rule="evenodd" points="99.823,56.445 0.177,56.445 0.178,70.246 66.694,70.246 47.897,89.043   57.678,98.824 99.801,56.701 99.667,56.566 "/></svg>
                            {/if}
                            </button>
                            <span class="name">
                                {#if contact.objectName.length > 20}
                                    {contact.objectName.slice(0,6)} ... {contact.objectName.slice(-8)}
                                {:else}
                                    {contact.objectName}
                                {/if}
                            </span>
                    </div>
                
                    {#if contact.relation == "trustedBy" && !$hasAvatar}
                        <button class="icon" on:click={() => handleInvite(fixSafeAddress(contact.objectAvatar))} aria-label="register">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 25" x="0px" y="0px"><g><path d="M6.13971,6.42572a3.19,3.19,0,1,1,3.19,3.19A3.19017,3.19017,0,0,1,6.13971,6.42572Zm4.85,8.49a1.50456,1.50456,0,0,1,1.34-1.49,1.47274,1.47274,0,0,1,1.34-1.32,3.45884,3.45884,0,0,0-2.85-1.49h-2.98a3.50386,3.50386,0,0,0-3.5,3.5v2.11a.49514.49514,0,0,0,.5.5h7.57a.83678.83678,0,0,1-.08-.31A1.50708,1.50708,0,0,1,10.98969,14.91571Zm4.17059-.49591h-.83447v-.83447a.5.5,0,0,0-1,0v.83447h-.83448a.5.5,0,0,0,0,1h.83448v.83447a.5.5,0,0,0,1,0V15.4198h.83447a.5.5,0,0,0,0-1Z"/></g></svg>
                        </button>
                    {:else}
                        <button class="icon" on:click={() => handleTransfer(fixSafeAddress(contact.objectAvatar))} aria-label="transfer">
                            <svg class="transfer" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" width="50" height="60">
                                <path d="m89.582 28.082h-56.523-0.019532-12.051c-1.7266 0-3.125 1.3984-3.125 3.125 0 1.7266 1.3984 3.125 3.125 3.125h8.0234l-2.6641 10.348h-15.93c-1.7266 0-3.125 1.3984-3.125 3.125 0 1.7266 1.3984 3.125 3.125 3.125h14.32l-2.6641 10.348h-8.0977c-1.7266 0-3.125 1.3984-3.125 3.125 0 1.7266 1.3984 3.125 3.125 3.125h10.359c0.058593 0 0.10547 0.035156 0.16406 0.035156h56.543c1.4219 0 2.668-0.95703 3.0234-2.3359l8.5469-33.242c0.23828-0.93359 0.027344-1.9258-0.5625-2.6875-0.58984-0.76172-1.5-1.207-2.4648-1.207zm-45.578 33.223h-15.488l6.9453-26.973h12.102c-2.1328 3.1406-3.7578 7-4.6094 11.242-1.2148 5.875-0.76562 11.449 1.0508 15.73zm21.758-12.5c-1.0703 5.3281-3.7422 10.109-6.8945 12.5h-7.625c-2.125-2.3828-3.5977-7.582-2.168-14.484 1.0664-5.3203 3.7305-10.09 6.875-12.488h7.6602c2.1172 2.3867 3.5781 7.5781 2.1523 14.465zm12.863 12.5h-11.355c2.1367-3.1445 3.7656-7.0078 4.6172-11.254 1.2109-5.8672 0.76172-11.438-1.0508-15.711h14.727l-6.9414 26.973z"/>
                            </svg>
                        </button>   
                    {/if}
                </div>
            {/each}
        {/if}

    </article>

</section>

<style>

   

    article {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;            
        justify-content: flex-start;
        width: 100%;
        max-width: calc(100% - 4rem);
        margin: auto;
        /* min-height: 100%; */
        

        > div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            height: 3.5rem;
            width: 100%;
            border-bottom:  3px solid black;
        }
    }

    .contact-left {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .name {
        line-height: 1.125;
        margin-right: 15px;
    }

    svg.relation {
        margin-top: 12px;
        margin-right: 15px;
    }

    svg.transfer {
        margin: 6px 0 0 auto;
    }

    label {
        text-align: center;
    }

    button.button {
        margin: 1.5rem 0 0 0;
    }

</style>