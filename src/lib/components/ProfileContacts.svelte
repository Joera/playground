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
    import { findSrvByChain } from "$lib/store/safe.store";
    import IconTransfer from "./IconTransfer.svelte";

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

        const srv = await findSrvByChain("gnosis");
        if (srv) {
            await updateContacts(srv);
        }
        
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

        const srv = await findSrvByChain("gnosis");
        if (srv) {
            network.set(
                await updateContacts(srv)
            );
        }
        
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
                            <IconTransfer></IconTransfer>
                        </button>
                    {:else}
                        <button class="icon" on:click={() => handleTransfer(fixSafeAddress(contact.objectAvatar))} aria-label="transfer">
                           
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